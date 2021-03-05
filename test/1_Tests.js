const tests = {
    HegicPool: require('./HegicPool.js'),
    HegicOptions: require('./HegicOptions.js'),
    HegicOptionsPricer: require('./HegicOptionsPricer.js'),
    HegicStaking: require('./HegicStaking.js'),
}

if(process.env.DEVMOD){
    // tests.HegicPool.test();
    // tests.HegicOptions.test();
    tests.HegicOptionsPricer.test();
    tests.HegicStaking.test();
} else {
    // tests.HegicPool.test();
    // tests.HegicOptions.test();
    tests.HegicOptionsPricer.test();
    // tests.HegicStaking.test();
}