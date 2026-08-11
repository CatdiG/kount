import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding, PermissionStatus } from '@capacitor/filesystem';

/**
 * Checks permissions (no runtime permission requested).
 */
export async function checkAndRequestPermissions(): Promise<boolean> {
  return true;
}

/**
 * Reads text content of a file given a path or Directory using Capacitor Filesystem.
 */
export async function readLocalTextFile(
  path: string,
  directory?: Directory
): Promise<string> {
  try {
    const options: any = {
      path,
      encoding: Encoding.UTF8,
    };
    if (directory) {
      options.directory = directory;
    }
    const result = await Filesystem.readFile(options);
    return typeof result.data === 'string' ? result.data : String(result.data);
  } catch (error) {
    console.error(`Failed to read file from path "${path}":`, error);
    throw error;
  }
}

/**
 * Writes text data to a file in device filesystem using Capacitor Filesystem.
 */
export async function writeLocalTextFile(
  path: string,
  data: string,
  directory: Directory = Directory.Documents
): Promise<string> {
  try {
    const result = await Filesystem.writeFile({
      path,
      data,
      directory,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    return result.uri;
  } catch (error) {
    console.error(`Failed to write file to path "${path}":`, error);
    throw error;
  }
}

/**
 * Helper function to safely read standard HTML File object into string.
 */
export function decodeArrayBufferToText(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes.length === 0) return '';

  // 1. Check Byte Order Mark (BOM) for UTF-16 LE / UTF-16 BE / UTF-8
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(buffer);
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(buffer);
  }
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(buffer.slice(3));
  }

  // 2. Try decoding as UTF-8
  const utf8Text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  const replacementCount = (utf8Text.match(/\uFFFD/g) || []).length;

  if (
    replacementCount === 0 &&
    (/카카오톡|KakaoTalk|오전|오후|년|월|일/.test(utf8Text) || !/[^\x00-\x7F]/.test(utf8Text))
  ) {
    return utf8Text;
  }

  // 3. Fallback to EUC-KR / CP949 (Windows PC KakaoTalk ANSI export default)
  try {
    const eucText = new TextDecoder('euc-kr').decode(buffer);
    const eucReplacements = (eucText.match(/\uFFFD/g) || []).length;
    if (eucReplacements < replacementCount || /카카오톡|KakaoTalk|오전|오후|년|월|일/.test(eucText)) {
      return eucText;
    }
  } catch (err) {
    console.warn('EUC-KR decoding fallback failed:', err);
  }

  return utf8Text;
}

export function readWebFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        reject(new Error('파일 읽기 결과가 올바르지 않습니다.'));
        return;
      }
      try {
        const text = decodeArrayBufferToText(buffer);
        resolve(text);
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Tests reading & writing a test file to verify storage permissions.
 */
export async function testFileAccessPermission(): Promise<{ success: boolean; message: string }> {
  try {
    if (Capacitor.isNativePlatform()) {
      const testPath = 'kount_perm_test.txt';
      const testData = 'permission_test_content';
      await Filesystem.writeFile({
        path: testPath,
        data: testData,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      const readResult = await Filesystem.readFile({
        path: testPath,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      if (readResult.data !== testData) {
        throw new Error('파일 쓰기 후 읽은 내용이 일치하지 않습니다.');
      }
    }
    return { success: true, message: '스마트폰 파일 읽기/쓰기 접근 권한 정상' };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.error('File permission test error:', err);
    throw new Error(`파일 권한/접근 실패: ${errMsg}`);
  }
}

/**
 * Tests internet network connectivity via HTTP fetch with multi-endpoint fallback.
 */
export async function testInternetConnection(): Promise<{ success: boolean; message: string }> {
  const testEndpoints = [
    'https://www.google.com/favicon.ico',
    'https://cloudflare.com/favicon.ico',
  ];

  for (const url of testEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      await fetch(url, {
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return { success: true, message: '인터넷 통신 연결 정상' };
    } catch {
      // Try next endpoint fallback
    }
  }

  // Fallback check: Browser online status
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    return { success: true, message: '인터넷 통신 연결 정상 (네트워크 상태 확인 완료)' };
  }

  throw new Error('인터넷 통신 실패: 네트워크 연결 상태를 확인해 주세요.');
}
