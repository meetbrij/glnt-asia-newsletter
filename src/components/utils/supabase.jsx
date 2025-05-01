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
      // .order('date', { ascending: false })
      .order('selected_for_newsletter', { ascending: false });

    if (error) {
      console.error('Fetch error:', error.message);
      throw new Error("Failed to fetch articles: " + error.message);
      // setError('Failed to load data. Please try again.');
    } else {
      // setSALES_APAC(apac_articles);
      const initiallySelected = apac_articles
        .filter((r) => r.selected_for_newsletter)
        .map((r) => r.id);
        console.error('initially selected:', initiallySelected);
      // setSelectedIds(initiallySelected);
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
  const updateFields = [];
  const params = [];
  
  // Map JavaScript camelCase to database snake_case
  const fieldMapping = {
    selectedForNewsletter: 'selected_for_newsletter',
    publishedInNewsletter: 'published_in_newsletter',
    newsletterId: 'newsletter_id'
  };
  
  Object.entries(data).forEach(([key, value]) => {
    const dbField = fieldMapping[key] || key;
    updateFields.push(`${dbField} = $${params.length + 1}`);
    params.push(value);
  });
  
  if (updateFields.length === 0) {
    return { success: false, error: "No fields to update" };
  }
  
  params.push(id); // Add ID as the last parameter
  
  const query = `
    UPDATE apac_article
    SET ${updateFields.join(", ")}
    WHERE id = $${params.length}
    RETURNING *
  `;
  
  const result = await executeQuery(query, params);
  
  if (!result.success || !result.data[0]) {
    throw new Error(result.error || "Failed to update article");
  }
  
  // Transform and return the updated article
  const article = result.data[0];
  return {
    id: article.id,
    title: article.title || "",
    company: article.company || "",
    country: article.country || "",
    source: article.source || "",
    summary: article.summary || "",
    category: article.category || "",
    url: article.url || "",
    created_date: article.created_date || new Date().toISOString(),
    date: article.published_date || new Date().toISOString(),
    selectedForNewsletter: article.selected_for_newsletter || false,
    publishedInNewsletter: article.published_in_newsletter || false,
    newsletterId: article.newsletter_id || null,
    views: article.views || 0
  };
}

/**
 * Fetch newsletters from newsletter table
 * @returns {Array} - List of newsletters
 */
export async function fetchNewsletters() {
  const query = `
    SELECT 
      n.id,
      n.title,
      n.description,
      n.publish_date as "publishDate",
      n.views,
      n.unique_readers as "uniqueReaders",
      COUNT(a.id) as article_count
    FROM newsletter n
    LEFT JOIN apac_article a ON a.newsletter_id = n.id
    GROUP BY n.id
    ORDER BY n.publish_date DESC
  `;
  
  const result = await executeQuery(query);
  
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch newsletters");
  }
  
  // Transform and return newsletters
  return result.data.map(newsletter => ({
    id: newsletter.id,
    title: newsletter.title || "Banking Technology Insights",
    description: newsletter.description || "Latest news and updates from the banking sector",
    publishDate: newsletter.publishDate || new Date().toISOString(),
    views: newsletter.views || 0,
    uniqueReaders: newsletter.uniqueReaders || 0,
    articleCount: newsletter.article_count || 0
  }));
}

/**
 * Create a new newsletter and update articles
 * @param {Object} newsletterData - Newsletter data
 * @param {Array} articleIds - IDs of articles to include in the newsletter
 * @returns {Object} - Created newsletter
 */
export async function createNewsletter(newsletterData, articleIds) {
  // First, create the newsletter
  const createQuery = `
    INSERT INTO newsletter (
      title,
      description,
      publish_date,
      views,
      unique_readers
    ) VALUES (
      $1, $2, $3, $4, $5
    )
    RETURNING *
  `;
  
  const createParams = [
    newsletterData.title,
    newsletterData.description,
    newsletterData.publishDate || new Date().toISOString(),
    0, // Initial views
    0  // Initial unique readers
  ];
  
  const createResult = await executeQuery(createQuery, createParams);
  
  if (!createResult.success || !createResult.data[0]) {
    throw new Error(createResult.error || "Failed to create newsletter");
  }
  
  const newNewsletter = createResult.data[0];
  
  // Update the articles to mark them as published in this newsletter
  if (Array.isArray(articleIds) && articleIds.length > 0) {
    const placeholders = articleIds.map((_, index) => `$${index + 2}`).join(', ');
    
    const updateQuery = `
      UPDATE apac_article
      SET 
        selected_for_newsletter = true,
        published_in_newsletter = true,
        newsletter_id = $1
      WHERE id IN (${placeholders})
    `;
    
    const updateParams = [newNewsletter.id, ...articleIds];
    
    await executeQuery(updateQuery, updateParams);
  }
  
  // Return the created newsletter
  return {
    id: newNewsletter.id,
    title: newNewsletter.title,
    description: newNewsletter.description,
    publishDate: newNewsletter.publish_date,
    views: newNewsletter.views || 0,
    uniqueReaders: newNewsletter.unique_readers || 0
  };
}

/**
 * Get articles for a specific newsletter
 * @param {string} newsletterId - Newsletter ID
 * @returns {Array} - List of articles in the newsletter
 */
export async function getNewsletterArticles(newsletterId) {
  const query = `
    SELECT 
      id,
      title,
      company,
      country,
      source,
      summary,
      category,
      url,
      created_date,
      published_date,
      selected_for_newsletter,
      published_in_newsletter,
      newsletter_id,
      views
    FROM apac_article
    WHERE newsletter_id = $1
    ORDER BY created_date DESC
  `;
  
  const result = await executeQuery(query, [newsletterId]);
  
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch newsletter articles");
  }
  
  // Transform and return the articles
  return result.data.map(article => ({
    id: article.id,
    title: article.title || "",
    company: article.company || "",
    country: article.country || "",
    source: article.source || "",
    summary: article.summary || "",
    category: article.category || "",
    url: article.url || "",
    created_date: article.created_date || new Date().toISOString(),
    date: article.published_date || new Date().toISOString(),
    selectedForNewsletter: article.selected_for_newsletter || false,
    publishedInNewsletter: article.published_in_newsletter || false,
    newsletterId: article.newsletter_id || null,
    views: article.views || 0
  }));
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