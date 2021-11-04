const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    const contractName = 'Star Notary MKB';
    const contractSymbol = 'SNMKB';

    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.name.call(), contractName);
    assert.equal(await instance.symbol.call(), contractSymbol);
});

it('lets 2 users exchange stars', async() => {
    const instance = await StarNotary.deployed();

    // 1. create 2 Stars with different tokenId
    const starId1 = 6;
    const starName1 = 'star 6';
    const userId1 = accounts[0];
    await instance.createStar(starName1, starId1, {from: userId1});

    const starId2 = 7;
    const starName2 = 'star 7';
    const userId2 = accounts[accounts.length - 1];
    await instance.createStar(starName2, starId2, {from: userId2});

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId1, starId2, {from: userId2});
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf(starId1), userId2);
    assert.equal(await instance.ownerOf(starId2), userId1);
});

it('lets a user transfer a star', async() => {
    const instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    const starId = 8;
    const starName = 'star 8';
    const userId1 = accounts[0];
    const userId2 = accounts[accounts.length - 1];

    await instance.createStar(starName, starId, {from: userId2});
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(userId1, starId, {from: userId2});
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf(starId), userId1);
});

it('lookUptokenIdToStarInfo test', async() => {
    const instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    const starId = 9;
    const starName = 'star 9';
    const userId = accounts[accounts.length - 1];

    await instance.createStar(starName, starId, {from: userId});

    // 2. Call your method lookUptokenIdToStarInfo
    const result = await instance.lookUptokenIdToStarInfo(starId);

    // 3. Verify if you Star name is the same
    assert.equal(result, starName);
});