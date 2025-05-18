describe('Basic user flow for Website', () => {
  // First, visit the lab 7 website
  beforeAll(async () => {
    await page.goto('https://cse110-sp25.github.io/CSE110-Shop/');
  });

  // Each it() call is a separate test
  // Here, we check to make sure that all 20 <product-item> elements have loaded
  it('Initial Home Page - Check for 20 product items', async () => {
    console.log('Checking for 20 product items...');

    // Query select all of the <product-item> elements and return the length of that array
    const numProducts = await page.$$eval('product-item', (prodItems) => {
      return prodItems.length;
    });

    // Expect there that array from earlier to be of length 20, meaning 20 <product-item> elements where found
    expect(numProducts).toBe(20);
  });

  // Check to make sure that all 20 <product-item> elements have data in them
  // We use .skip() here because this test has a TODO that has not been completed yet.
  // Make sure to remove the .skip after you finish the TODO. 
  // changed from it.skip() => it()
  it('Make sure <product-item> elements are populated', async () => {
    console.log('Checking to make sure <product-item> elements are populated...');

    // Start as true, if any don't have data, swap to false
    // let allArePopulated = true;

    // // Query select all of the <product-item> elements
    // const prodItemsData = await page.$$eval('product-item', prodItems => {
    //   return prodItems.map(item => {
    //     // Grab all of the json data stored inside
    //     return data = item.data;
    //   });
    // });

    // console.log(`Checking product item 1/${prodItemsData.length}`);

    // // Make sure the title, price, and image are populated in the JSON
    // firstValue = prodItemsData[0];
    // if (firstValue.title.length == 0) { allArePopulated = false; }
    // if (firstValue.price.length == 0) { allArePopulated = false; }
    // if (firstValue.image.length == 0) { allArePopulated = false; }

    // // Expect allArePopulated to still be true
    // expect(allArePopulated).toBe(true);

    /**
    **** TODO - STEP 1 (DONE)****
    * Right now this function is only checking the first <product-item> it found, make it so that
      it checks every <product-item> it found
    * Remove the .skip from this it once you are finished writing this test.
    */

    // Revised changes (for step 1):
    // Grab the .data object from every <product-item>
    const allData = await page.$$eval('product-item', items =>
      items.map(item => item.data)
    );

    // Sanity check: we should have 20 products
    expect(allData.length).toBe(20);

    // Loop through each product and verify fields are non-empty
    allData.forEach((data, i) => {
      console.log(`Checking product ${i + 1}/${allData.length}`);
      expect(data.title.length).toBeGreaterThan(0);
      expect(data.price.toString().length).toBeGreaterThan(0);
      expect(data.image.length).toBeGreaterThan(0);
    });

  }, 10000);

  // Check to make sure that when you click "Add to Cart" on the first <product-item> that
  // the button swaps to "Remove from Cart"
  // Changed it.skip => it
  it('Clicking the "Add to Cart" button should change button text', async () => {
    console.log('Checking the "Add to Cart" button...');

    /**
     **** TODO - STEP 2 (DONE) **** 
     * Query a <product-item> element using puppeteer ( checkout page.$() and page.$$() in the docs )
     * Grab the shadowRoot of that element (it's a property), then query a button from that shadowRoot.
     * Once you have the button, you can click it and check the innerText property of the button.
     * Once you have the innerText property, use innerText.jsonValue() to get the text value of it
     * Remember to remove the .skip from this it once you are finished writing this test.
     */

     // 1. Grab the first <product-item> element
    const prodItem = await page.$('product-item');

    // 2. Get its shadowRoot and then the <button> within
    const shadow = await prodItem.getProperty('shadowRoot');
    const button = await shadow.$('button');

    // 3. Click the button
    await button.click();

    // 4. Read back its innerText and assert it changed
    const textHandle = await button.getProperty('innerText');
    const buttonText = await textHandle.jsonValue();
    expect(buttonText).toBe('Remove from Cart');

  }, 2500);

  // Check to make sure that after clicking "Add to Cart" on every <product-item> that the Cart
  // number in the top right has been correctly updated
  // STEP 3
  // it('Checking number of items in cart on screen', async () => {
  //   console.log('Checking number of items in cart on screen...');

  //   async () => {
  //     console.log('Checking number of items in cart on screen...');

  //     // Grab every <product-item> on the page
  //     const items = await page.$$('product-item');

  //     for (const item of items) {
  //       // Make sure the element is in view so the click will register
  //       await item.evaluate((elem) => elem.scrollIntoView());

  //       const shadow = await item.getProperty('shadowRoot');
  //       const button = await shadow.$('button');
  //       const text   = await (await button.getProperty('innerText')).jsonValue();

  //       if (text === 'Add to Cart') {
  //         await button.click();
  //       }
  //     }

  //     // Wait until #cart‑count shows 20
  //     await page.waitForFunction(
  //       () => document.querySelector('#cart-count').innerText === '20'
  //     );

  //     const cartCount = await page.$eval('#cart-count', (el) => el.innerText);
  //     expect(cartCount).toBe('20');
    
  //   }, 20000
  // ); // changed to 20000 from 10000 (attempt to fix error)
  
  // STEP 3 REVISION:
  it(
    'Checking number of items in cart on screen',
    async () => {
      console.log('Checking number of items in cart on screen...');

      // Grab every <product-item> on the page
      const items = await page.$$('product-item');

      for (const item of items) {
        // Ensure the element is in view so the click registers
        await item.evaluate(elem => elem.scrollIntoView());

        const shadow = await item.getProperty('shadowRoot');
        const button = await shadow.$('button');
        const text   = await (await button.getProperty('innerText')).jsonValue();

        // Click only if it still shows “Add to Cart”
        if (text === 'Add to Cart') {
          await button.click();
        }
      }

      // Wait until #cart-count displays 20
      await page.waitForFunction(
        () => document.querySelector('#cart-count').innerText === '20'
      );

      // Assert the counter is 20
      const cartCount = await page.$eval('#cart-count', el => el.innerText);
      expect(cartCount).toBe('20');
    },
    20000 // give the loop ample time
  );


  // Check to make sure that after you reload the page it remembers all of the items in your cart
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');

    /**
     **** TODO - STEP 4 **** 
     * Reload the page, then select all of the <product-item> elements, and check every
       element to make sure that all of their buttons say "Remove from Cart".
     * Also check to make sure that #cart-count is still 20
     * Remember to remove the .skip from this it once you are finished writing this test.
     */

     // 1. Reload the page so it picks up localStorage state
     await page.reload();

     // 2. Grab all <product-item> elements
     const items = await page.$$('product-item');

     // 3. Verify each button now reads "Remove from Cart"
     for (const item of items) {
      const shadow = await item.getProperty('shadowRoot');
      const button = await shadow.$('button');
      const text = await (await button.getProperty('innerText')).jsonValue();
      expect(text).toBe('Remove from Cart');
    }

    // 4. Confirm the cart count is still 20
    const count = await page.$eval('#cart-count', el => el.innerText);

    // Added line to fix error:
    // await page.waitForNavigation({ waitUntil: 'networkidle0' });

    expect(Number(count)).toBe(20);

  }, 10000);

  // Check to make sure that the cart in localStorage is what you expect
  it('Checking the localStorage to make sure cart is correct', async () => {

    /**
     **** TODO - STEP 5 **** 
     * At this point the item 'cart' in localStorage should be 
       '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]', check to make sure it is
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
    // 1. Read the 'cart' item from localStorage
    const cartData = await page.evaluate(() => localStorage.getItem('cart'));

    // 2. Assert it matches the full array of IDs 1–20
    expect(cartData).toBe('[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]');

  });

  // Checking to make sure that if you remove all of the items from the cart that the cart
  // number in the top right of the screen is 0
  it('Checking number of items in cart on screen after removing from cart', async () => {
    console.log('Checking number of items in cart on screen...');

    /**
     **** TODO - STEP 6 **** 
     * Go through and click "Remove from Cart" on every single <product-item>, just like above.
     * Once you have, check to make sure that #cart-count is now 0
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
    
     // 1. Grab all <product-item> elements
    const items = await page.$$('product-item');

    // 2. Click "Remove from Cart" on each one
    for (const item of items) {
      const shadow = await item.getProperty('shadowRoot');
      const button = await shadow.$('button');
      await button.click();
    }

    // 3. Read the cart count and assert it’s 0
    const count = await page.$eval('#cart-count', el => el.innerText);
    expect(Number(count)).toBe(0);

  }, 20000);

  // Checking to make sure that it remembers us removing everything from the cart
  // after we refresh the page
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');

    /**
     **** TODO - STEP 7 **** 
     * Reload the page once more, then go through each <product-item> to make sure that it has remembered nothing
       is in the cart - do this by checking the text on the buttons so that they should say "Add to Cart".
     * Also check to make sure that #cart-count is still 0
     * Remember to remove the .skip from this it once you are finished writing this test.
     */
    // 1. Reload the page so it re‑reads localStorage
    await page.reload();

    // 2. Grab every <product-item> element
    const items = await page.$$('product-item');

    // 3. Each button should now say “Add to Cart”
    for (const item of items) {
      const shadow = await item.getProperty('shadowRoot');
      const button = await shadow.$('button');
      const text = await (await button.getProperty('innerText')).jsonValue();
      expect(text).toBe('Add to Cart');
    }

    // 4. Cart count should still show 0
    const count = await page.$eval('#cart-count', el => el.innerText);
    expect(Number(count)).toBe(0);

  }, 10000);

  // Checking to make sure that localStorage for the cart is as we'd expect for the
  // cart being empty
  it('Checking the localStorage to make sure cart is correct', async () => {
    console.log('Checking the localStorage...');

    /**
     **** TODO - STEP 8 **** 
     * At this point he item 'cart' in localStorage should be '[]', check to make sure it is
     * Remember to remove the .skip from this it once you are finished writing this test.
     */

    // 1. Read the cart entry from localStorage
    const cartData = await page.evaluate(() => localStorage.getItem('cart'));

    // 2. It should be an empty array
    expect(cartData).toBe('[]');
  });
});
