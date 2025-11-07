import { IncomingMessage } from 'http';

export async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        if (body === '') {
          resolve({});
        } else {
          resolve(JSON.parse(body));
        }
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

export interface ParsedUrl {
  pathname: string;
  userId?: string;
}

export function parseUrl(url: string | undefined): ParsedUrl {
  if (!url) {
    return { pathname: '' };
  }

  const urlPattern = /^\/api\/users(?:\/([^/?]+))?/;
  const match = url.match(urlPattern);

  if (!match) {
    return { pathname: url };
  }

  return {
    pathname: match[1] ? '/api/users/:id' : '/api/users',
    userId: match[1],
  };
}

