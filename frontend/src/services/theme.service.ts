import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = 'light-theme';

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
    const themeLink = document.getElementById('theme-link') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = `assets/${this.currentTheme}.css`;
    }
  }
}
