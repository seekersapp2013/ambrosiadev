# Content Visibility Fix Script
# This script approves all your content so it shows in the "All Content" tab

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Content Visibility Fix Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Checking your content status..." -ForegroundColor Yellow
Write-Host ""
npx convex run debugContent:checkContentApprovalStatus
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 2: Approving all your content..." -ForegroundColor Yellow
Write-Host ""
npx convex run debugContent:approveMyContent
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 3: Verifying the fix..." -ForegroundColor Yellow
Write-Host ""
npx convex run debugContent:checkContentApprovalStatus
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done! Your content should now be visible." -ForegroundColor Green
Write-Host ""
Write-Host "If you still don't see your content:" -ForegroundColor Yellow
Write-Host "1. Refresh your browser" -ForegroundColor White
Write-Host "2. Check that your content is set to 'Public' (isPublic = true)" -ForegroundColor White
Write-Host "3. Check that articles are 'PUBLISHED' status" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
