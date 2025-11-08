import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function MigrationTest() {
  const migrateArticles = useMutation(api.articles.addSellerAddressesToGatedArticles);
  const migrateReels = useMutation(api.reels.addSellerAddressesToGatedReels);

  const handleMigrateArticles = async () => {
    try {
      const result = await migrateArticles();
      console.log('Articles migration result:', result);
      alert(`Articles migration complete: ${result.updated} updated, ${result.skipped} skipped`);
    } catch (error) {
      console.error('Articles migration failed:', error);
      alert('Articles migration failed');
    }
  };

  const handleMigrateReels = async () => {
    try {
      const result = await migrateReels();
      console.log('Reels migration result:', result);
      alert(`Reels migration complete: ${result.updated} updated, ${result.skipped} skipped`);
    } catch (error) {
      console.error('Reels migration failed:', error);
      alert('Reels migration failed');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Migration Tools</h2>
      <div className="space-y-2">
        <button
          onClick={handleMigrateArticles}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Migrate Articles
        </button>
        <button
          onClick={handleMigrateReels}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Migrate Reels
        </button>
      </div>
    </div>
  );
}