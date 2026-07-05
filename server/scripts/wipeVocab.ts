import { db } from '../src/database';
import { vocabularies } from '../src/database/schema';

async function main() {
    console.log("Wiping vocabularies table...");
    await db.delete(vocabularies);
    console.log("Done.");
    process.exit(0);
}
main();
