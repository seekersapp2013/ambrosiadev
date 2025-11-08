import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

const password = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [password],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      // Only create profile for new users
      if (!existingUserId) {
        console.log('Creating profile for new user:', userId);
        
        // Get the user data
        const user = await ctx.db.get(userId);
        if (!user) {
          console.error('User not found after creation:', userId);
          return;
        }

        // Check if profile already exists
        const existingProfile = await ctx.db
          .query("profiles")
          .filter((q) => q.eq(q.field("userId"), userId))
          .first();

        if (existingProfile) {
          console.log('Profile already exists for user:', userId);
          return;
        }

        // Create username from name
        const userName = user.name || 'User';
        let username = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // If the cleaned username is empty, use a fallback
        if (!username) {
          username = 'user';
        }
        
        // Ensure username is unique
        let counter = 1;
        let finalUsername = username;
        while (true) {
          const existingUsernameProfile = await ctx.db
            .query("profiles")
            .filter((q) => q.eq(q.field("username"), finalUsername))
            .first();
          
          if (!existingUsernameProfile) break;
          
          finalUsername = `${username}${counter}`;
          counter++;
        }

        // Create the profile
        try {
          const profileId = await ctx.db.insert("profiles", {
            userId,
            username: finalUsername,
            name: userName,
            createdAt: Date.now(),
          });
          console.log('Profile created successfully for new user:', { userId, profileId, username: finalUsername });
        } catch (error) {
          console.error('Error creating profile for new user:', error);
        }
      }
    },
  },
});
