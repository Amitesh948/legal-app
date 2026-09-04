const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`[BROWSER PAGE ERROR]: ${error.message}`);
  });

  try {
    // Navigate to app
    await page.goto('http://localhost:8100/auth/login');
    await page.waitForSelector('input[type="email"]');
    
    // Login
    await page.type('input[type="email"]', 'advocate_rp@yopmail.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForNavigation();
    
    // Navigate directly to a case's AI chat (we use the first case assigned to this advocate)
    // Wait for the HTTP requests or just hardcode the case ID we assigned earlier
    const caseId = '3dd5c8e6-f58a-4f50-b6bc-d41fad7635fd';
    await page.goto(`http://localhost:8100/advocate/cases/${caseId}/ai-chat`);
    
    // Wait a few seconds for component to init and load
    await new Promise(r => setTimeout(r, 3000));
    
  } catch (err) {
    console.error("Puppeteer Script Error:", err);
  } finally {
    await browser.close();
  }
})();
