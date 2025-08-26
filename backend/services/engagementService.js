/**
 * Social Media Engagement Analysis Service
 * Analyzes extracted text and provides optimization suggestions
 */

/**
 * Generate engagement suggestions based on extracted text
 * @param {string} text - The extracted text content
 * @param {string} type - File type ('pdf' or 'image')
 * @returns {Object} - Engagement analysis with suggestions and scores
 */
const analyzeEngagement = (text, type = 'unknown') => {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      grade: 'F',
      suggestions: ['No text content found to analyze'],
      analysis: {
        hashtags: { found: 0, recommended: 3 },
        mentions: { found: 0, recommended: 2 },
        callToAction: { found: false, strength: 'none' },
        length: { current: 0, optimal: '140-280' },
        readability: { score: 0, level: 'poor' },
        sentiment: { tone: 'neutral', engagement: 'low' }
      }
    };
  }

  console.log(`📊 Analyzing engagement for ${type} content...`);

  const analysis = {
    hashtags: analyzeHashtags(text),
    mentions: analyzeMentions(text),
    callToAction: analyzeCallToAction(text),
    length: analyzeLength(text),
    readability: analyzeReadability(text),
    sentiment: analyzeSentiment(text),
    emojis: analyzeEmojis(text)
  };

  const suggestions = generateSuggestions(analysis, text);
  const score = calculateEngagementScore(analysis);
  const grade = getEngagementGrade(score);

  console.log(`✅ Engagement analysis complete: ${score}/100 (${grade})`);

  return {
    score,
    grade,
    suggestions,
    analysis,
    optimizedContent: generateOptimizedVersion(text, analysis)
  };
};

/**
 * Analyze hashtag usage
 */
const analyzeHashtags = (text) => {
  const hashtagRegex = /#[\w]+/g;
  const hashtags = text.match(hashtagRegex) || [];
  
  return {
    found: hashtags.length,
    recommended: hashtags.length < 3 ? 3 : hashtags.length,
    list: hashtags,
    density: (hashtags.length / text.split(/\s+/).length) * 100
  };
};

/**
 * Analyze mention usage
 */
const analyzeMentions = (text) => {
  const mentionRegex = /@[\w]+/g;
  const mentions = text.match(mentionRegex) || [];
  
  return {
    found: mentions.length,
    recommended: mentions.length < 2 ? 2 : mentions.length,
    list: mentions
  };
};

/**
 * Analyze call-to-action presence
 */
const analyzeCallToAction = (text) => {
  const ctaWords = [
    'click', 'buy', 'shop', 'download', 'subscribe', 'follow', 'share',
    'like', 'comment', 'join', 'sign up', 'get started', 'learn more',
    'discover', 'explore', 'try', 'watch', 'read', 'visit', 'check out'
  ];
  
  const lowerText = text.toLowerCase();
  const foundCTAs = ctaWords.filter(cta => lowerText.includes(cta));
  
  let strength = 'none';
  if (foundCTAs.length >= 3) strength = 'strong';
  else if (foundCTAs.length >= 2) strength = 'medium';
  else if (foundCTAs.length >= 1) strength = 'weak';
  
  return {
    found: foundCTAs.length > 0,
    strength,
    words: foundCTAs,
    count: foundCTAs.length
  };
};

/**
 * Analyze content length
 */
const analyzeLength = (text) => {
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  
  let platform = 'general';
  let optimal = '140-280';
  let status = 'good';
  
  if (charCount > 280) {
    platform = 'linkedin';
    optimal = '100-300';
    status = charCount > 500 ? 'too_long' : 'good';
  } else if (charCount <= 280) {
    platform = 'twitter';
    optimal = '140-280';
    status = charCount < 100 ? 'too_short' : 'good';
  }
  
  return {
    characters: charCount,
    words: wordCount,
    platform,
    optimal,
    status
  };
};

/**
 * Analyze readability
 */
const analyzeReadability = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = text.split(/\s+/).filter(word => word.length > 0).length;
  const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
  
  let score = 100;
  let level = 'excellent';
  
  // Penalty for long sentences
  if (avgWordsPerSentence > 20) {
    score -= 30;
    level = 'difficult';
  } else if (avgWordsPerSentence > 15) {
    score -= 15;
    level = 'moderate';
  }
  
  // Penalty for very short content
  if (words < 10) {
    score -= 20;
    level = 'too_short';
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score: Math.round(score),
    level,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    sentences,
    complexity: avgWordsPerSentence > 15 ? 'high' : avgWordsPerSentence > 10 ? 'medium' : 'low'
  };
};

/**
 * Analyze sentiment and tone
 */
const analyzeSentiment = (text) => {
  const positiveWords = ['great', 'awesome', 'amazing', 'excellent', 'fantastic', 'love', 'best', 'perfect', 'wonderful', 'incredible', 'outstanding', 'brilliant'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'failed', 'broken', 'useless'];
  const engagementWords = ['new', 'exciting', 'innovative', 'revolutionary', 'breakthrough', 'exclusive', 'limited', 'special', 'unique', 'trending'];
  
  const lowerText = text.toLowerCase();
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  const engagementCount = engagementWords.filter(word => lowerText.includes(word)).length;
  
  let tone = 'neutral';
  let engagement = 'medium';
  
  if (positiveCount > negativeCount) tone = 'positive';
  else if (negativeCount > positiveCount) tone = 'negative';
  
  if (engagementCount >= 3) engagement = 'high';
  else if (engagementCount >= 1) engagement = 'medium';
  else engagement = 'low';
  
  return {
    tone,
    engagement,
    positiveWords: positiveCount,
    negativeWords: negativeCount,
    engagementWords: engagementCount
  };
};

/**
 * Analyze emoji usage
 */
const analyzeEmojis = (text) => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const emojis = text.match(emojiRegex) || [];
  
  return {
    found: emojis.length,
    list: [...new Set(emojis)],
    density: (emojis.length / text.split(/\s+/).length) * 100
  };
};

/**
 * Generate optimization suggestions
 */
const generateSuggestions = (analysis, text) => {
  const suggestions = [];
  
  // Hashtag suggestions
  if (analysis.hashtags.found === 0) {
    suggestions.push({
      type: 'hashtags',
      priority: 'high',
      icon: '🏷️',
      title: 'Add Hashtags for Discoverability',
      description: 'Include 2-3 relevant hashtags to increase reach and engagement',
      example: '#innovation #tech #socialmedia'
    });
  } else if (analysis.hashtags.found > 5) {
    suggestions.push({
      type: 'hashtags',
      priority: 'medium',
      icon: '⚠️',
      title: 'Reduce Hashtag Count',
      description: 'Too many hashtags can appear spammy. Keep it to 3-5 relevant ones',
      example: 'Focus on your top 3 most relevant hashtags'
    });
  }
  
  // Call-to-action suggestions
  if (!analysis.callToAction.found) {
    suggestions.push({
      type: 'cta',
      priority: 'high',
      icon: '👆',
      title: 'Include a Clear Call-to-Action',
      description: 'Add a specific action you want your audience to take',
      example: '"What do you think? Share your thoughts in comments!"'
    });
  } else if (analysis.callToAction.strength === 'weak') {
    suggestions.push({
      type: 'cta',
      priority: 'medium',
      icon: '💪',
      title: 'Strengthen Your Call-to-Action',
      description: 'Make your call-to-action more compelling and specific',
      example: 'Use stronger verbs like "discover", "explore", or "join"'
    });
  }
  
  // Length suggestions
  if (analysis.length.status === 'too_long') {
    suggestions.push({
      type: 'length',
      priority: 'medium',
      icon: '✂️',
      title: 'Shorten Your Content',
      description: 'Consider breaking long content into multiple posts or key points',
      example: 'Aim for 140-280 characters for better engagement'
    });
  } else if (analysis.length.status === 'too_short') {
    suggestions.push({
      type: 'length',
      priority: 'low',
      icon: '📝',
      title: 'Add More Context',
      description: 'Provide more details or context to engage your audience better',
      example: 'Add background information or personal insights'
    });
  }
  
  // Mention suggestions
  if (analysis.mentions.found === 0) {
    suggestions.push({
      type: 'mentions',
      priority: 'medium',
      icon: '👥',
      title: 'Tag Relevant People or Brands',
      description: 'Mention relevant accounts to increase visibility and engagement',
      example: '@company @influencer or industry leaders'
    });
  }
  
  // Emoji suggestions
  if (analysis.emojis.found === 0) {
    suggestions.push({
      type: 'emojis',
      priority: 'low',
      icon: '😊',
      title: 'Add Emojis for Visual Appeal',
      description: 'Emojis can increase engagement and make content more approachable',
      example: '🚀 ✨ 💡 for tech content'
    });
  }
  
  // Readability suggestions
  if (analysis.readability.level === 'difficult') {
    suggestions.push({
      type: 'readability',
      priority: 'high',
      icon: '📚',
      title: 'Improve Readability',
      description: 'Break long sentences into shorter, more digestible chunks',
      example: 'Keep sentences under 15-20 words for better engagement'
    });
  }
  
  // Sentiment suggestions
  if (analysis.sentiment.engagement === 'low') {
    suggestions.push({
      type: 'engagement',
      priority: 'medium',
      icon: '🔥',
      title: 'Use More Engaging Language',
      description: 'Add excitement and energy to capture attention',
      example: 'Use words like "amazing", "breakthrough", "exclusive"'
    });
  }
  
  return suggestions;
};

/**
 * Calculate overall engagement score
 */
const calculateEngagementScore = (analysis) => {
  let score = 50; // Base score
  
  // Hashtag scoring
  if (analysis.hashtags.found >= 2 && analysis.hashtags.found <= 5) score += 15;
  else if (analysis.hashtags.found >= 1) score += 10;
  else score -= 10;
  
  // Call-to-action scoring
  if (analysis.callToAction.strength === 'strong') score += 20;
  else if (analysis.callToAction.strength === 'medium') score += 15;
  else if (analysis.callToAction.strength === 'weak') score += 10;
  else score -= 15;
  
  // Length scoring
  if (analysis.length.status === 'good') score += 15;
  else if (analysis.length.status === 'too_long') score -= 5;
  else if (analysis.length.status === 'too_short') score -= 10;
  
  // Readability scoring
  score += Math.round(analysis.readability.score * 0.2);
  
  // Sentiment scoring
  if (analysis.sentiment.engagement === 'high') score += 15;
  else if (analysis.sentiment.engagement === 'medium') score += 10;
  else score -= 5;
  
  // Mentions scoring
  if (analysis.mentions.found >= 1 && analysis.mentions.found <= 3) score += 10;
  else if (analysis.mentions.found > 3) score -= 5;
  
  // Emoji scoring
  if (analysis.emojis.found >= 1 && analysis.emojis.found <= 3) score += 5;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Get engagement grade based on score
 */
const getEngagementGrade = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

/**
 * Generate optimized version of content
 */
const generateOptimizedVersion = (text, analysis) => {
  let optimized = text.trim();
  
  // Add hashtags if missing
  if (analysis.hashtags.found === 0) {
    const suggestedHashtags = ['#content', '#engagement', '#socialmedia'];
    optimized += '\n\n' + suggestedHashtags.join(' ');
  }
  
  // Add call-to-action if missing
  if (!analysis.callToAction.found) {
    optimized += '\n\nWhat are your thoughts? Share in the comments! 👇';
  }
  
  return optimized;
};

module.exports = {
  analyzeEngagement
};
