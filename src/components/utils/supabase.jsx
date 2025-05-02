/**
 * Utility functions for Supabase integration
 */

import { QuerySupabase } from "./supabaseClient";

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
  await QuerySupabase
      .from('newsletter')
      .increment('views', 1) // Increment 'views' by 1
      .eq('id', newsletterId);
}

/**
 * Update article views
 * @param {string} articleId - Article ID
 * @returns {Object} - Updated article
 */
export async function incrementArticleViews(articleId) {
  await QuerySupabase
      .from('apac_article')
      .increment('views', 1) // Increment 'views' by 1
      .eq('id', articleId);
}

/**
 * Get analytics data for manager dashboard
 * @returns {Object} - Analytics data
 */
export async function getAnalyticsData() {
  // Get total articles count
  const { data1, error1, count: totalArticlesResult } = await QuerySupabase
      .from('apac_article')
      .select('*', { count: 'exact', head: true }) // `head: true` avoids fetching actual rows

  if (error1) {
    console.error('Error fetching count:', error1)
  } else {
    console.log('Row count:', data1, totalArticlesResult)
  }
  const totalArticles = totalArticlesResult;
  
  // Get selected articles count
  const { data2, error2, count: publishedArticlesResult } = await QuerySupabase
    .from('apac_article')
    .select('*', { count: 'exact', head: true })
    .eq('published_in_newsletter', true)

  if (error2) {
    console.error('Error fetching count:', error2)
  } else {
    console.log('Count of published articles:', data2, publishedArticlesResult)
  }
  
  const publishedArticles = publishedArticlesResult;
  
  // Get newsletters count
  
  const { data3, error3, count: newslettersResult } = await QuerySupabase
    .from('newsletter')
    .select('*', { count: 'exact', head: true })

  if (error3) {
    console.error('Error fetching count:', error3)
  } else {
    console.log('Total newsletters:', data3, newslettersResult)
  }
  const publishedNewsletters = newslettersResult;
  
  // Get articles by category
  const categoriesQuery = `
    SELECT category, COUNT(*) as count 
    FROM apac_article 
    WHERE category IS NOT NULL 
    GROUP BY category 
    ORDER BY count DESC
  `;

  const categoriesData = [];
  
  // Get articles by country
  const countriesQuery = `
    SELECT country, COUNT(*) as count 
    FROM apac_article 
    WHERE country IS NOT NULL 
    GROUP BY country 
    ORDER BY count DESC
  `;

  const countriesData = [];
  
  return {
    totalArticles,
    publishedArticles, 
    publishedNewsletters,
    categoriesData,
    countriesData,
    // Mock subscribers data since it doesn't exist in our DB
    subscribers: 0
  };
}