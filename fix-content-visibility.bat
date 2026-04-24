@echo off
echo ========================================
echo Content Visibility Fix Tool
echo ========================================
echo.
echo Step 1: Checking your content status...
echo.
npx convex run debugContent:checkContentApprovalStatus
echo.
echo ========================================
echo.
echo Step 2: Approving all your content...
echo.
npx convex run debugContent:approveMyContent
echo.
echo ========================================
echo.
echo Step 3: Verifying the fix...
echo.
npx convex run debugContent:checkContentApprovalStatus
echo.
echo ========================================
echo Done! Your content should now be visible in the "All Content" tab.
echo.
echo If you still don't see your content:
echo 1. Refresh your browser
echo 2. Check that your content is set to "Public" (isPublic = true)
echo 3. Check that articles are "PUBLISHED" status
echo.
pause
