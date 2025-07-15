import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import PromptRefiner from './PromptRefiner';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock lodash debounce to make tests synchronous
jest.mock('lodash', () => ({
  debounce: jest.fn((fn) => {
    const mockDebounced = (...args: unknown[]) => fn(...args);
    mockDebounced.cancel = jest.fn();
    return mockDebounced;
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('PromptRefiner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with header and textarea', () => {
    render(<PromptRefiner />);
    
    expect(screen.getByRole('heading', { name: /promptrefiner/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type your prompt here/i)).toBeInTheDocument();
    expect(screen.getByText(/craft better ai prompts/i)).toBeInTheDocument();
    expect(screen.getByText(/powered by openai/i)).toBeInTheDocument();
  });

  it('displays suggestions correctly when API returns data', async () => {
    const mockResponse = {
      data: {
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
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(<PromptRefiner />);
    const textarea = screen.getByPlaceholderText(/type your prompt here/i);
    
    await userEvent.type(textarea, 'Tell me about dogs');

    await waitFor(() => {
      expect(screen.getByText(/refined suggestions/i)).toBeInTheDocument();
    });

    // Check that suggestions are rendered
    expect(screen.getByText('Provide a detailed overview of golden retrievers, including their history, temperament, and care requirements.')).toBeInTheDocument();
    expect(screen.getByText('Write a comprehensive guide about golden retrievers for potential dog owners.')).toBeInTheDocument();
    
    // Check clarity scores
    expect(screen.getByText('8/10')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();
    
    // Check explanations
    expect(screen.getByText('💡 Added specificity about breed and requested detailed information categories.')).toBeInTheDocument();
    expect(screen.getByText('💡 Specified target audience and format for better context.')).toBeInTheDocument();
    
    // Check copy buttons
    const copyButtons = screen.getAllByText('Copy');
    expect(copyButtons).toHaveLength(2);
  });

  it('shows loading state during API call', async () => {
    // Mock a slow API response
    mockedAxios.post.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: { suggestions: [] } }), 100)));

    render(<PromptRefiner />);
    const textarea = screen.getByPlaceholderText(/type your prompt here/i);
    
    await userEvent.type(textarea, 'Test prompt');

    // Check for loading spinner
    await waitFor(() => {
      const loadingSpinner = screen.getByRole('textbox').parentElement?.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const mockError = {
      response: {
        data: {
          error: 'OpenAI API key not configured'
        }
      }
    };

    mockedAxios.post.mockRejectedValueOnce(mockError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    render(<PromptRefiner />);
    const textarea = screen.getByPlaceholderText(/type your prompt here/i);
    
    await userEvent.type(textarea, 'Test prompt');

    await waitFor(() => {
      expect(screen.getByText('Error: OpenAI API key not configured')).toBeInTheDocument();
    });
  });

  it('handles copy to clipboard functionality', async () => {
    const mockResponse = {
      data: {
        suggestions: [
          {
            id: '1',
            refined: 'Test refined prompt',
            clarity: 8,
            explanation: 'Test explanation'
          }
        ]
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(<PromptRefiner />);
    const textarea = screen.getByPlaceholderText(/type your prompt here/i);
    
    await userEvent.type(textarea, 'Test prompt');

    await waitFor(() => {
      expect(screen.getByText('Test refined prompt')).toBeInTheDocument();
    });

    const copyButton = screen.getByText('Copy');
    await userEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test refined prompt');
  });

  it('clears suggestions when input is empty', async () => {
    const mockResponse = {
      data: {
        suggestions: [
          {
            id: '1',
            refined: 'Test refined prompt',
            clarity: 8,
            explanation: 'Test explanation'
          }
        ]
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(<PromptRefiner />);
    const textarea = screen.getByPlaceholderText(/type your prompt here/i);
    
    // Type some text
    await userEvent.type(textarea, 'Test prompt');

    await waitFor(() => {
      expect(screen.getByText('Test refined prompt')).toBeInTheDocument();
    });

    // Clear the input
    await userEvent.clear(textarea);

    await waitFor(() => {
      expect(screen.queryByText('Test refined prompt')).not.toBeInTheDocument();
    });
  });

  it('makes API call with correct parameters', async () => {
    const mockResponse = {
      data: {
        suggestions: []
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(<PromptRefiner />);
    const textarea = screen.getByPlaceholderText(/type your prompt here/i);
    
    await userEvent.type(textarea, 'Test prompt');

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/refine', {
        prompt: 'Test prompt'
      });
    });
  });

  it('displays message when no suggestions are available', async () => {
    render(<PromptRefiner />);
    const textarea = screen.getByPlaceholderText(/type your prompt here/i);
    
    await userEvent.type(textarea, 'Test prompt');

    // Mock no response to simulate no suggestions
    mockedAxios.post.mockResolvedValueOnce({
      data: { suggestions: [] }
    });

    await waitFor(() => {
      expect(screen.getByText('Type a prompt to see refinement suggestions...')).toBeInTheDocument();
    });
  });

  it('handles non-axios errors', async () => {
    const mockError = new Error('Network error');
    
    mockedAxios.post.mockRejectedValueOnce(mockError);
    mockedAxios.isAxiosError.mockReturnValue(false);

    render(<PromptRefiner />);
    const textarea = screen.getByPlaceholderText(/type your prompt here/i);
    
    await userEvent.type(textarea, 'Test prompt');

    await waitFor(() => {
      expect(screen.getByText('Error: An unexpected error occurred')).toBeInTheDocument();
    });
  });

  it('renders clarity score progress bars correctly', async () => {
    const mockResponse = {
      data: {
        suggestions: [
          {
            id: '1',
            refined: 'Test refined prompt',
            clarity: 8,
            explanation: 'Test explanation'
          }
        ]
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(<PromptRefiner />);
    const textarea = screen.getByPlaceholderText(/type your prompt here/i);
    
    await userEvent.type(textarea, 'Test prompt');

    await waitFor(() => {
      expect(screen.getByText('8/10')).toBeInTheDocument();
    });

    // Check that progress bar is rendered with correct width (80% for score 8/10)
    const progressBar = screen.getByText('8/10').parentElement?.querySelector('.bg-gradient-to-r');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle('width: 80%');
  });
});