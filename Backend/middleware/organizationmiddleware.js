

const { getOrganizationById } = require("../services/organizationservices");

/**
 * Middleware to check if an organization exists and attach it to req object.
 * @param {boolean} requireOrg  
 */
function organizationMiddleware(requireOrg = true) {
    return async (req, res, next) => {
        try {
            const orgId = req.headers["x-organization-id"] || req.query.orgId;

            
            if (!orgId) {
                if (requireOrg) {
                    return res.status(400).json({ error: "Organization ID is required" });
                } else {
                    return next();
                }
            }

          
            if (!/^[a-zA-Z0-9-_]+$/.test(orgId)) {
                return res.status(400).json({ error: "Invalid Organization ID format" });
            }

           
            const organization = await getOrganizationById(orgId);
            if (!organization) {
                return res.status(404).json({ error: "Organization not found" });
            }

           
            req.organization = organization;
            next();
        } catch (err) {
            console.error("Organization middleware error:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    };
}

module.exports = organizationMiddleware;