@echo off
echo Approving all content...
npx convex run migrations/approveAllExistingContent:run
echo.
echo Done! Check the output above.
pause
