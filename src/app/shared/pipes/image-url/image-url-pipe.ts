import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    // If it's already an absolute URL (http or https), return it as is
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    // Otherwise, prepend the baseUrl (ensure no double slashes)
    const baseUrl = environment.baseUrl.replace(/\/$/, ''); // remove trailing slash if any
    const path = value.startsWith('/') ? value : `/${value}`;
    
    return `${baseUrl}${path}`;
  }
}
