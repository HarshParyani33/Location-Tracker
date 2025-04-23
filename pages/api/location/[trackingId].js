import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { trackingId } = req.query;

    try {
        await dbConnect();

        const user = await User.findOne({ trackingId });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        return res.status(200).json(user.location);
    } catch (error) {
        console.error('Error fetching location:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 