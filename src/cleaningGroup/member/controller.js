const logger = require("../../api/logger");
const { Member } = require('../../models');

class MemberController {
    // Get all members
    static async getAllMembers(req, res) {
        try {
            logger.info('Getting all members');
            
            const members = await Member.scope('active').findAll({
                attributes: ['id', 'name', 'member_class', 'role', 'status', 'isActive'], // Exclude password by default for security
                order: [['name', 'ASC']]
            });

            return res.status(200).json({
                success: true,
                data: members,
                message: 'Members retrieved successfully'
            });
        } catch (error) {
            logger.error('Error getting members:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all pending members for admin approval
    static async getPendingMembers(req, res) {
        try {
            logger.info('Getting all pending members');
            
            const members = await Member.findAll({
                where: { status: 'pending', isActive: true },
                attributes: ['id', 'name', 'member_class', 'role', 'status', 'created_at'],
                order: [['created_at', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: members,
                message: 'Pending members retrieved successfully'
            });
        } catch (error) {
            logger.error('Error getting pending members:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Approve a member
    static async approveMember(req, res) {
        try {
            const { id } = req.params;
            const update_user = req.user?.id || 1;

            logger.info(`Approving member ID: ${id}`);

            const member = await Member.findByPk(id);

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            await member.update({
                status: 'approved',
                update_user
            });

            return res.status(200).json({
                success: true,
                data: { id: member.id, status: member.status },
                message: 'Member approved successfully'
            });
        } catch (error) {
            logger.error('Error approving member:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Reject a member
    static async rejectMember(req, res) {
        try {
            const { id } = req.params;
            const update_user = req.user?.id || 1;

            logger.info(`Rejecting member ID: ${id}`);

            const member = await Member.findByPk(id);

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            await member.update({
                status: 'rejected',
                update_user
            });

            return res.status(200).json({
                success: true,
                data: { id: member.id, status: member.status },
                message: 'Member rejected successfully'
            });
        } catch (error) {
            logger.error('Error rejecting member:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get member by ID
    static async getMemberById(req, res) {
        try {
            const { id } = req.params;
            logger.info(`Getting member by ID: ${id}`);

            const member = await Member.findOne({
                where: { id, isActive: true },
                attributes: ['id', 'name', 'member_class', 'role', 'status', 'isActive']
            });

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: member,
                message: 'Member retrieved successfully'
            });
        } catch (error) {
            logger.error('Error getting member by ID:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Create new member
    static async createMember(req, res) {
        try {
            const { name, password, member_class, role } = req.body;
            const inputter = req.user?.id || 1;

            logger.info('Creating new member:', { name });

            if (!name || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and password are required'
                });
            }

            const newMember = await Member.create({
                name,
                password,
                member_class,
                role,
                inputter,
                isActive: true
            });

            // Remove password from response
            const memberResponse = newMember.toJSON();
            delete memberResponse.password;

            return res.status(201).json({
                success: true,
                data: memberResponse,
                message: 'Member created successfully'
            });
        } catch (error) {
            logger.error('Error creating member:', error);
            
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
                    success: false,
                    message: 'Member already exists'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update member
    static async updateMember(req, res) {
        try {
            const { id } = req.params;
            const { name, password, member_class, role } = req.body;
            const update_user = req.user?.id || 1;

            logger.info(`Updating member ID: ${id}`);

            const member = await Member.findOne({
                where: { id, isActive: true }
            });

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            await member.update({
                name: name || member.name,
                password: password || member.password,
                member_class: member_class !== undefined ? member_class : member.member_class,
                role: role !== undefined ? role : member.role,
                update_user
            });

            const memberResponse = member.toJSON();
            delete memberResponse.password;

            return res.status(200).json({
                success: true,
                data: memberResponse,
                message: 'Member updated successfully'
            });
        } catch (error) {
            logger.error('Error updating member:', error);
            
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete member (soft delete)
    static async deleteMember(req, res) {
        try {
            const { id } = req.params;
            const update_user = req.user?.id || 1;

            logger.info(`Deleting member ID: ${id}`);

            const member = await Member.findOne({
                where: { id, isActive: true }
            });

            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            await member.update({
                isActive: false,
                update_user
            });

            return res.status(200).json({
                success: true,
                message: 'Member deleted successfully'
            });
        } catch (error) {
            logger.error('Error deleting member:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
    // Member Login
    static async login(req, res) {
        try {
            const { name, password } = req.body;
            logger.info(`Member login attempt: ${name}`);

            const member = await Member.findOne({
                where: { name, password, isActive: true }
            });

            if (!member) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid name or password'
                });
            }

            if (member.status !== 'approved') {
                return res.status(403).json({
                    success: false,
                    message: `Login failed. Your status is ${member.status}. Please wait for admin approval.`
                });
            }

            const memberResponse = member.toJSON();
            delete memberResponse.password;

            return res.status(200).json({
                success: true,
                data: memberResponse,
                accessToken: 'simulated-member-token-' + member.id,
                message: 'Login successful'
            });
        } catch (error) {
            logger.error('Error logging in member:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Member Social Login
    static async socialLogin(req, res) {
        try {
            const { name, email, socialId, socialProvider, profilePhoto } = req.body;
            logger.info(`Social login attempt: ${socialProvider} - ${name}`);

            if (!socialId || !socialProvider) {
                return res.status(400).json({
                    success: false,
                    message: 'Social ID and Provider are required'
                });
            }

            let member = await Member.findOne({
                where: { socialId, socialProvider, isActive: true }
            });

            if (!member) {
                // Check if email already exists
                if (email) {
                    const existingEmail = await Member.findOne({ where: { email, isActive: true } });
                    if (existingEmail) {
                        return res.status(400).json({
                            success: false,
                            message: 'Email already registered with another account'
                        });
                    }
                }

                // Create new social member
                member = await Member.create({
                    name,
                    email,
                    socialId,
                    socialProvider,
                    profilePhoto,
                    status: 'pending', // Still requires admin approval as per previous logic
                    isActive: true
                });
                logger.info(`New social member created: ${name}`);
            } else {
                // Update existing member's photo if provided
                if (profilePhoto && member.profilePhoto !== profilePhoto) {
                    await member.update({ profilePhoto });
                }
            }

            if (member.status !== 'approved') {
                return res.status(403).json({
                    success: false,
                    message: `Account pending. Your status is ${member.status}. Please wait for admin approval.`
                });
            }

            const memberResponse = member.toJSON();
            delete memberResponse.password;

            return res.status(200).json({
                success: true,
                data: memberResponse,
                accessToken: 'simulated-social-token-' + member.id,
                message: 'Login successful'
            });
        } catch (error) {
            logger.error('Error in social login:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = MemberController;
