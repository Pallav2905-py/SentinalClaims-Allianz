import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient("mongodb+srv://pallav:pallav@pallav-hobby.toevxky.mongodb.net/allianz_auth");
const db = client.db();

export const auth = betterAuth({

    baseURL: process.env.BETTER_AUTH_URL,
    database: mongodbAdapter(db, {
        client,
        // useTxn: false  // Disable transactions for standalone MongoDB
    }),


    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: "348132861635-80stm7ghjrphp9q56o80vra5kbkva4m3.apps.googleusercontent.com",
            clientSecret: "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",
        },
    },
    // socialProviders: {
    //     github: {
    //         clientId: process.env.GITHUB_CLIENT_ID as string,
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //     },
    // },
});