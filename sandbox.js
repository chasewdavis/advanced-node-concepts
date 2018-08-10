// Mongo Query from http://mongoosejs.com/docs/queries.html

Person // addressing a collection
    .find({ occupation: /host/ })                   // all return new querys that have been further customized in some fashion
    .where('name.last').equals('Ghost')             // all return new querys that have been further customized in some fashion
    .where('age').gt(17).lt(66)                     // all return new querys that have been further customized in some fashion
    .where('likes').in(['vaporizing', 'talking'])   // all return new querys that have been further customized in some fashion
    .limit(10)                                      // all return new querys that have been further customized in some fashion
    .sort('-occupation')                            // all return new querys that have been further customized in some fashion
    .select('name occupation')                      // all return new querys that have been further customized in some fashion
    .exec(callback) // what takes query and sends it off to mongoDB!

// --- without .exec(callback) --- //
const query = Person // represents some pending query that MIGHT be issued over to mongo at some point in the future
    .find({ occupation: /host/ })
    .where('name.last').equals('Ghost')
    .where('age').gt(17).lt(66)
    .where('likes').in(['vaporizing', 'talking'])
    .limit(10)
    .sort('-occupation')
    .select('name occupation');
// --- READY TO SEND --- //

query.getOptions(); // returns a stringified object that is unique to this exact query
// result: "{ find: { occupation: 'host' }, where: [{'name.last': 'Ghost' ...

// Check if this query has already been fetched in redis
query.exec(); // one possible way to send off to mongoDB

query.exec((err, result) => console.log(result)); // another way
// Same as...
query.then(result => console.log(result));
// Same as... 
const result = await query; // THIS IS EXECUTING THE QUERY!!!

// to make our lives easier... 
// overwrite the existing query.exec function to do the redis check automatically!!!

query.exec = function() {
    // to check to see if this query has already been executed
    // and if it has return the result right away
    // client is refering to the redis client
    const result = client.get('query key');
    if (result) {
        return result;
    }
    // otherwise issure the query to mongo
    const result = runTheOriginalExecFunction();

    // this save that value in redis
    client.set('query key', result);

    return result;
}
