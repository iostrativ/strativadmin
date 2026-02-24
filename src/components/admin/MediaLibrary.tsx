import { MediaUpload } from './MediaUpload';
import { MediaGrid } from './MediaGrid';

export function MediaLibrary() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Upload and manage your images</p>
        </div>
      </div>

      {/* Upload Area */}
      <MediaUpload />

      {/* Media Grid */}
      <MediaGrid />
    </div>
  );
}
