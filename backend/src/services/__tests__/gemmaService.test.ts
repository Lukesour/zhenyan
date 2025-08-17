import { GemmaService } from '../gemmaService';

// Mock fetch globally
global.fetch = jest.fn();

describe('GemmaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAiScore', () => {
    it('should return a score when API call is successful', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: '分数：85'
              }]
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GemmaService.getAiScore('测试文本');
      
      expect(result).toBe(85);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gemma-3-27b'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      );
    });

    it('should throw error when API call fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(GemmaService.getAiScore('测试文本')).rejects.toThrow('Network error');
    });

    it('should throw error when response format is invalid', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: []
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(GemmaService.getAiScore('测试文本')).rejects.toThrow('Invalid response format from Gemma API');
    });

    it('should ensure score is within 0-100 range', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: '分数：150'
              }]
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GemmaService.getAiScore('测试文本');
      
      expect(result).toBe(100);
    });
  });

  describe('testConnection', () => {
    it('should return true when connection test is successful', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: '分数：80'
              }]
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GemmaService.testConnection();
      
      expect(result).toBe(true);
    });

    it('should return false when connection test fails', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GemmaService.testConnection();
      
      expect(result).toBe(false);
    });
  });
});
