import { Pipe, PipeTransform } from '@angular/core';

/**
 * Uses HTML to render the spaces, line breaks, bullet points, and bold text as intended
 * by the LLM.
 */

@Pipe({
  name: 'textToHtmlPipe',
  standalone: true,
})
export class TextToHtmlPipe implements PipeTransform {
  transform(value: string | Promise<string>): string {
    if (value instanceof Promise) {
      return '';
    }

    // Helper boolean for transforming ** into bold tags
    let shouldUseOpeningTag: boolean = false;

    return value
      .replace(/\*\*/g, () => {
        shouldUseOpeningTag = !shouldUseOpeningTag;
        return shouldUseOpeningTag ? '<b>' : '</b>';
      })
      .replace(/ {2}/g, '&nbsp;&nbsp;')
      .replace(/\n/g, '<br>')
      .replace(/\*\s/g, '&#x2022; ');
  }
}
