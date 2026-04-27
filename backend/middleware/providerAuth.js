const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const authHeader = req.header('Authorization');

    // Check if not token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify token (uses same secret as regular auth, or can be separate)
        const secret = process.env.JWT_SECRET || 'fallback_secret_key';
        const decoded = jwt.verify(token, secret);

        // provider tokens will encode { provider: { id: ... } } instead of { user: { id: ... } }
        if (!decoded.provider) {
             return res.status(401).json({ msg: 'Token is not a valid provider token' });
        }

        req.provider = decoded.provider;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
