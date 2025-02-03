import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
// ...existing code...

@NgModule({
  declarations: [
    // ...existing code...
  ],
  imports: [
    BrowserModule,
    HttpClientModule, // Add HttpClientModule here
    // ...existing code...
  ],
  providers: [],
  // bootstrap: [AppComponent]
})
export class AppModule { }
