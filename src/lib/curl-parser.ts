// cURL command parser

export interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * Parse a cURL command string into its components
 */
export function parseCurl(curlCommand: string): ParsedCurl {
  const result: ParsedCurl = {
    url: '',
    method: 'GET',
    headers: {},
  };

  // Clean up the command - remove line breaks and extra spaces
  let cmd = curlCommand
    .replace(/\\\n/g, ' ')
    .replace(/\\\r\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove 'curl' prefix if present
  if (cmd.toLowerCase().startsWith('curl ')) {
    cmd = cmd.substring(5).trim();
  }

  // Extract method (-X or --request)
  const methodMatch = cmd.match(/(?:-X|--request)\s+['"]?([A-Z]+)['"]?/i);
  if (methodMatch) {
    result.method = methodMatch[1].toUpperCase();
  }

  // Extract headers (-H or --header)
  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
  let headerMatch;
  while ((headerMatch = headerRegex.exec(cmd)) !== null) {
    const headerValue = headerMatch[1];
    const colonIndex = headerValue.indexOf(':');
    if (colonIndex > 0) {
      const key = headerValue.substring(0, colonIndex).trim();
      const value = headerValue.substring(colonIndex + 1).trim();
      result.headers[key] = value;
    }
  }

  // Extract data (-d or --data or --data-raw)
  const dataMatch = cmd.match(/(?:-d|--data|--data-raw)\s+['"](.+?)['"]/);
  if (dataMatch) {
    result.body = dataMatch[1];
    // Default to POST if data is present and method wasn't specified
    if (!methodMatch) {
      result.method = 'POST';
    }
  }

  // Extract URL - it's usually the last quoted or unquoted string that looks like a URL
  // First try to find a quoted URL
  const quotedUrlMatch = cmd.match(/['"]((https?:\/\/|www\.)[^'"]+)['"]/);
  if (quotedUrlMatch) {
    result.url = quotedUrlMatch[1];
  } else {
    // Try to find an unquoted URL
    const urlMatch = cmd.match(/(https?:\/\/\S+)/);
    if (urlMatch) {
      result.url = urlMatch[1];
    }
  }

  // Clean up URL - remove any trailing options that might have been captured
  result.url = result.url.replace(/\s.*$/, '');

  return result;
}

/**
 * Convert parsed curl back to a formatted string for display
 */
export function formatCurlCommand(parsed: ParsedCurl): string {
  const parts = ['curl'];

  if (parsed.method !== 'GET') {
    parts.push(`-X ${parsed.method}`);
  }

  for (const [key, value] of Object.entries(parsed.headers)) {
    parts.push(`-H '${key}: ${value}'`);
  }

  if (parsed.body) {
    parts.push(`-d '${parsed.body}'`);
  }

  parts.push(`'${parsed.url}'`);

  return parts.join(' \\\n  ');
}
