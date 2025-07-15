// Mock fetch globally
global.fetch = jest.fn();

// Mock the Next.js server components
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string, public init: { body: string }) {}
    async json() {
      return JSON.parse(this.init.body);
    }
  },
  NextResponse: {
    json: jest.fn((data: unknown, options?: { status?: number }) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  },
}));

import { NextRequest } from 'next/server';
import { POST } from './route';

describe('/api/refine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it('should return valid JSON with suggestions', async () => {
    // Mock OpenAI API response
    const mockOpenAIResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            suggestions: [
              {
                id: '1',
                refined: 'Provide a detailed overview of golden retrievers, including their history, temperament, and care requirements.',
                clarity: 8,
                explanation: 'Added specificity about breed and requested detailed information categories.'
              },
              {
                id: '2',
                refined: 'Write a comprehensive guide about golden retrievers for potential dog owners.',
                clarity: 7,
                explanation: 'Specified target audience and format for better context.'
              }
            ]
          })
        }
      }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOpenAIResponse,
    });

    const request = new NextRequest('http://localhost:3000/api/refine', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Tell me about dogs' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('suggestions');
    expect(Array.isArray(data.suggestions)).toBe(true);
    expect(data.suggestions).toHaveLength(2);
    
    // Validate structure of each suggestion
    data.suggestions.forEach((suggestion: { id: string; refined: string; clarity: number; explanation: string }) => {
      expect(suggestion).toHaveProperty('id');
      expect(suggestion).toHaveProperty('refined');
      expect(suggestion).toHaveProperty('clarity');
      expect(suggestion).toHaveProperty('explanation');
      expect(typeof suggestion.clarity).toBe('number');
      expect(suggestion.clarity).toBeGreaterThanOrEqual(1);
      expect(suggestion.clarity).toBeLessThanOrEqual(10);
    });
  });

  it('should handle missing prompt', async () => {
    const request = new NextRequest('http://localhost:3000/api/refine', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid prompt provided');
  });

  it('should handle missing OpenAI API key', async () => {
    delete process.env.OPENAI_API_KEY;

    const request = new NextRequest('http://localhost:3000/api/refine', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test prompt' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('OpenAI API key not configured');
  });

  it('should handle OpenAI API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const request = new NextRequest('http://localhost:3000/api/refine', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test prompt' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Failed to refine prompt');
  });

  it('should handle malformed JSON from OpenAI and provide fallback', async () => {
    const mockOpenAIResponse = {
      choices: [{
        message: {
          content: 'Invalid JSON response'
        }
      }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOpenAIResponse,
    });

    const request = new NextRequest('http://localhost:3000/api/refine', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test prompt' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('suggestions');
    expect(Array.isArray(data.suggestions)).toBe(true);
    expect(data.suggestions).toHaveLength(1);
    expect(data.suggestions[0]).toHaveProperty('id');
    expect(data.suggestions[0]).toHaveProperty('refined');
    expect(data.suggestions[0]).toHaveProperty('clarity');
    expect(data.suggestions[0]).toHaveProperty('explanation');
  });

  it('should limit suggestions to maximum of 3', async () => {
    const mockOpenAIResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            suggestions: [
              { id: '1', refined: 'Suggestion 1', clarity: 8, explanation: 'Explanation 1' },
              { id: '2', refined: 'Suggestion 2', clarity: 7, explanation: 'Explanation 2' },
              { id: '3', refined: 'Suggestion 3', clarity: 9, explanation: 'Explanation 3' },
              { id: '4', refined: 'Suggestion 4', clarity: 6, explanation: 'Explanation 4' },
              { id: '5', refined: 'Suggestion 5', clarity: 8, explanation: 'Explanation 5' },
            ]
          })
        }
      }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOpenAIResponse,
    });

    const request = new NextRequest('http://localhost:3000/api/refine', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test prompt' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions).toHaveLength(3);
  });

  it('should sanitize clarity scores to be between 1 and 10', async () => {
    const mockOpenAIResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            suggestions: [
              { id: '1', refined: 'Suggestion 1', clarity: 15, explanation: 'Explanation 1' },
              { id: '2', refined: 'Suggestion 2', clarity: -5, explanation: 'Explanation 2' },
              { id: '3', refined: 'Suggestion 3', clarity: 0, explanation: 'Explanation 3' },
            ]
          })
        }
      }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOpenAIResponse,
    });

    const request = new NextRequest('http://localhost:3000/api/refine', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Test prompt' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.suggestions[0].clarity).toBe(10); // Clamped from 15
    expect(data.suggestions[1].clarity).toBe(1);  // Clamped from -5
    expect(data.suggestions[2].clarity).toBe(5);  // Defaults to 5 when 0 (falsy)
  });
});