import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

// Handle user creation/update
export async function handleUserUpsert(userData) {
    try {
        const { id: clerkId, email_addresses, first_name, last_name, image_url, username } = userData;
        const email = email_addresses?.[0]?.email_address || '';

        const user = await User.findOneAndUpdate(
            { clerkId },
            {
                clerkId,
                email,
                firstName: first_name || '',
                lastName: last_name || '',
                username: username || email.split('@')[0],
                imageUrl: image_url || '',
                lastActive: new Date(),
                updatedAt: new Date()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('User synced:', user.email);
    } catch (error) {
        console.error('Error syncing user:', error);
    }
}

// Handle user deletion
export async function handleUserDelete(userData) {
    try {
        await User.findOneAndDelete({ clerkId: userData.id });
        console.log('User deleted:', userData.id);
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// Sync user manually
export async function syncUser(clerkId) {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    await handleUserUpsert(clerkUser);
    return { success: true, message: 'User synced successfully' };
}
