/**
 * This specifies the type of a TreeNode.
 * We have 3 types of nodes:
 * 1.Cell nodes, 1x1 ranges
 * 2.Range nodes, nxm ranges n>1||m>1
 * 3.Chart nodes
 */
define("DataDebugMethods/NodeTypes", function () {
    return {"Cell": 0, "Range": 1, "Chart": 2};
});