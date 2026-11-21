
const Organization = require("../Models/organizationmodel");

async function getOrganizationById(orgId) {
    return await Organization.findOne({
        organizationId: orgId,
        status: "active"
    });
}

module.exports = {
    getOrganizationById
};
