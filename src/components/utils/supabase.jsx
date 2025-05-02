/**
 * Utility functions for Supabase integration
 */

import { QuerySupabase } from "./supabaseClient";

/**
 * Execute a Supabase query with error handling
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters
 * @returns {Object} - Query result or empty array for data
 */
export async function executeQuery(query, params = []) {
  
}

/**
 * Fetch articles from apac_article table
 * @param {Object} filters - Optional filters for the query
 * @returns {Array} - List of articles
 */
export async function fetchArticles() {
  let { data: apac_articles, error } = await QuerySupabase
      .from('apac_article')
      .select('*')
      .not('title', 'is', null)
      .neq('title', '')
      .order('selected_for_newsletter', { ascending: false });

    if (error) {
      console.error('Fetch error:', error.message);
      throw new Error("Failed to fetch articles: " + error.message);
    }
    return apac_articles;
}

export async function fetchPublishedArticles() {
  let { data: apac_articles, error } = await QuerySupabase
      .from('apac_article')
      .select('*')
      .eq('published_in_newsletter', true)
      .order('selected_for_newsletter', { ascending: false });

    if (error) {
      console.error('Fetch error:', error.message);
      throw new Error("Failed to fetch articles: " + error.message);
    }
    return apac_articles;
}

/**
 * Update article in apac_article table
 * @param {string} id - Article ID
 * @param {Object} data - Data to update
 * @returns {Object} - Updated article
 */
export async function updateArticle(id, data) {

  let { data: updated_article, error } = await QuerySupabase
    .from('apac_article')
    .update({ selected_for_newsletter: data.selectedForNewsletter })
    .eq('id', id)
    .select();
  
  if (error) {
    throw new Error("Failed to update article: " + error.message);
  }
  
  return updated_article;
}

/**
 * Fetch newsletters from newsletter table
 * @returns {Array} - List of newsletters
 */
export async function fetchNewsletters() {
  let { data: newsletters, error } = await QuerySupabase
      .from('newsletter')
      .select('*')
      .order('publishDate', { ascending: false });

    if (error) {
      console.error('Fetch error:', error.message);
      throw new Error("Failed to fetch articles: " + error.message);
    } 
    return newsletters;
}

/**
 * Create a new newsletter and update articles
 * @param {Object} newsletterData - Newsletter data
 * @param {Array} articleIds - IDs of articles to include in the newsletter
 * @returns {Object} - Created newsletter
 */
export async function createNewsletter(newsletterData, articleIds) {

  articleIds.map(async (a) => {
    await QuerySupabase
      .from('apac_article')
      .update({ published_in_newsletter: true })
      .eq('id', a);
  });

  const { data: newsletter, error } = await QuerySupabase
    .from('newsletter')
    .insert([
      {
        title: newsletterData.title,
        description: newsletterData.description,
        publishDate: newsletterData.publishDate || new Date().toISOString(),
        views: 0,
        uniqueReaders: 0,
        articles: articleIds // array of article IDs
      }
    ])
    .select(); // optional: include this if you want the inserted row returned

  if (error) {
    console.error('Insert error:', error.message);
    throw new Error("Failed to create newsletter: " + error.message);
  } else {
    console.log('Inserted newsletter:', newsletter);
  }
  
  return newsletter;
}

/**
 * Get articles for a specific newsletter
 * @param {string} newsletterId - Newsletter ID
 * @returns {Array} - List of articles in the newsletter
 */
export async function getNewsletterArticles(articleIds) {
  let { data: news_articles, error } = await QuerySupabase
    .from('apac_article')
    .select('*')
    .in('id', articleIds); // articleIds = [2, 33, 22, 54, 3, 7]

    if (error) {
      console.error('Fetch error:', error.message);
      throw new Error("Failed to fetch articles: " + error.message);
    }
    return news_articles;
}

/**
 * Update newsletter views
 * @param {string} newsletterId - Newsletter ID
 * @returns {Object} - Updated newsletter
 */
export async function incrementNewsletterViews(newsletterId) {
  const query = `
    UPDATE newsletter
    SET views = COALESCE(views, 0) + 1
    WHERE id = $1
    RETURNING *
  `;
  
  await executeQuery(query, [newsletterId]);
}

/**
 * Update article views
 * @param {string} articleId - Article ID
 * @returns {Object} - Updated article
 */
export async function incrementArticleViews(articleId) {
  const query = `
    UPDATE apac_article
    SET views = COALESCE(views, 0) + 1
    WHERE id = $1
    RETURNING *
  `;
  
  await executeQuery(query, [articleId]);
}

/**
 * Get analytics data for manager dashboard
 * @returns {Object} - Analytics data
 */
export async function getAnalyticsData() {
  // Get total articles count
  const totalArticlesQuery = `SELECT COUNT(*) as count FROM apac_article`;
  const totalArticlesResult = await executeQuery(totalArticlesQuery);
  const totalArticles = totalArticlesResult.success ? (totalArticlesResult.data[0]?.count || 0) : 0;
  
  // Get selected articles count
  const selectedArticlesQuery = `SELECT COUNT(*) as count FROM apac_article WHERE selected_for_newsletter = true`;
  const selectedArticlesResult = await executeQuery(selectedArticlesQuery);
  const selectedArticles = selectedArticlesResult.success ? (selectedArticlesResult.data[0]?.count || 0) : 0;
  
  // Get published articles count
  const publishedArticlesQuery = `SELECT COUNT(*) as count FROM apac_article WHERE published_in_newsletter = true`;
  const publishedArticlesResult = await executeQuery(publishedArticlesQuery);
  const publishedArticles = publishedArticlesResult.success ? (publishedArticlesResult.data[0]?.count || 0) : 0;
  
  // Get newsletters count
  const newslettersQuery = `SELECT COUNT(*) as count FROM newsletter`;
  const newslettersResult = await executeQuery(newslettersQuery);
  const publishedNewsletters = newslettersResult.success ? (newslettersResult.data[0]?.count || 0) : 0;
  
  // Get articles by category
  const categoriesQuery = `
    SELECT category, COUNT(*) as count 
    FROM apac_article 
    WHERE category IS NOT NULL 
    GROUP BY category 
    ORDER BY count DESC
  `;
  const categoriesResult = await executeQuery(categoriesQuery);
  const categoriesData = categoriesResult.success ? 
    categoriesResult.data.map(item => ({ name: item.category, count: item.count })) : [];
  
  // Get articles by country
  const countriesQuery = `
    SELECT country, COUNT(*) as count 
    FROM apac_article 
    WHERE country IS NOT NULL 
    GROUP BY country 
    ORDER BY count DESC
  `;
  const countriesResult = await executeQuery(countriesQuery);
  const countriesData = countriesResult.success ? 
    countriesResult.data.map(item => ({ name: item.country, count: item.count })) : [];
  
  return {
    totalArticles,
    selectedArticles,
    publishedArticles, 
    publishedNewsletters,
    categoriesData,
    countriesData,
    // Mock subscribers data since it doesn't exist in our DB
    subscribers: 0
  };
}