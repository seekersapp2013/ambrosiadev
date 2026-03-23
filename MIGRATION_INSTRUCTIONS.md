# 🔄 Database Migration Required

The wallet system refactoring requires removing the old `sellerAddress` field from existing articles and reels in your database.

## 📋 Steps to Complete Migration

### 1. Deploy the Migration Functions
First, make sure your Convex deployment is up to date:
```bash
npx convex dev
```

### 2. Run the Migration
Execute the migration using this command:
```bash
npx convex run migrations:removeSellerAddressFields
```

### 3. Remove Temporary Schema Fields
After the migration completes successfully, remove the temporary `sellerAddress` fields from `convex/schema.ts`:

**In the articles table definition, remove this line:**
```typescript
sellerAddress: v.optional(v.string()), // TEMPORARY: Remove after migration
```

**In the reels table definition, remove this line:**
```typescript
sellerAddress: v.optional(v.string()), // TEMPORARY: Remove after migration
```

### 4. Redeploy Schema
After removing the temporary fields, redeploy:
```bash
npx convex dev
```

## 🔍 What This Migration Does

- **Removes `sellerAddress` field** from all existing articles and reels
- **Preserves all other data** including gating settings (isGated, priceToken, priceAmount)
- **Updates schema** to match the new record-based wallet system

## ⚠️ Important Notes

- The migration is **safe** and only removes the deprecated `sellerAddress` field
- All gated content will continue to work with the new internal wallet system
- Content pricing and gating settings are preserved
- No user data or wallet balances are affected

## 🆘 If You Encounter Issues

If the migration fails or you see errors:

1. Ensure your Convex deployment is running (`npx convex dev`)
2. Check the Convex dashboard for any error logs
3. Try running the migration again: `npx convex run migrations:removeSellerAddressFields`
4. If issues persist, you can check the migration status in the Convex dashboard

## ✅ Verification

After completing the migration:
- Your app should start without schema validation errors
- Existing gated content should work with the new wallet system
- Users can deposit/withdraw/transfer funds in USD and NGN
- All wallet operations should work correctly

---

**Need help?** The migration is designed to be safe and reversible. All your content and user data will be preserved.