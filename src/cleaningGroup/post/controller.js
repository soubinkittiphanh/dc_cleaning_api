const { CleaningPost, Member, CleaningPostLike, CleaningPostComment, sequelize } = require('../../models');

exports.createPost = async (req, res) => {
    try {
        const { content, photoUrl, bagsCollected, location, authorId } = req.body;
        
        const post = await CleaningPost.create({
            content,
            photoUrl,
            bagsCollected: bagsCollected || 0,
            location,
            authorId: authorId || req.user?.id // Fallback to auth user if available
        });

        res.status(201).json(post);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Failed to create post", error: error.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const currentUserId = req.query.userId || req.user?.id;

        const posts = await CleaningPost.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Member,
                    as: 'author',
                    attributes: ['id', 'name', 'profilePhoto']
                },
                {
                    model: CleaningPostLike,
                    as: 'likes',
                    attributes: ['memberId']
                },
                {
                    model: CleaningPostComment,
                    as: 'comments',
                    attributes: ['id']
                }
            ]
        });

        // Format response with counts and liked status
        const formattedPosts = posts.map(post => {
            const postJson = post.toJSON();
            const likeCount = postJson.likes ? postJson.likes.length : 0;
            const commentCount = postJson.comments ? postJson.comments.length : 0;
            const isLiked = postJson.likes ? postJson.likes.some(l => l.memberId == currentUserId) : false;
            
            delete postJson.likes;
            delete postJson.comments;
            
            return {
                ...postJson,
                likeCount,
                commentCount,
                isLiked
            };
        });

        res.status(200).json(formattedPosts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Failed to fetch posts", error: error.message });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const { postId, memberId } = req.body;
        
        const existingLike = await CleaningPostLike.findOne({
            where: { postId, memberId }
        });

        if (existingLike) {
            await existingLike.destroy();
            res.status(200).json({ liked: false });
        } else {
            await CleaningPostLike.create({ postId, memberId });
            res.status(200).json({ liked: true });
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Failed to toggle like", error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { postId, memberId, content } = req.body;
        
        const comment = await CleaningPostComment.create({
            postId,
            memberId,
            content
        });

        // Fetch comment with author info
        const fullComment = await CleaningPostComment.findByPk(comment.id, {
            include: [{
                model: Member,
                as: 'member',
                attributes: ['id', 'name', 'profilePhoto']
            }]
        });

        res.status(201).json(fullComment);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Failed to add comment", error: error.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await CleaningPostComment.findAll({
            where: { postId },
            order: [['createdAt', 'ASC']],
            include: [{
                model: Member,
                as: 'member',
                attributes: ['id', 'name', 'profilePhoto']
            }]
        });
        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Failed to fetch comments", error: error.message });
    }
};
