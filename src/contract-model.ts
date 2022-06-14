import { ResourceKind } from './acl';
import { allContractsData } from './db';

export type Contract = {
    _id: string;
    ownerId: string;
    comments: Array<{
        userId: string;
        text: string;
    }>,
};

export function toContractResource(contract: Contract) {
    return {
        kind: ResourceKind.CONTRACT,
        id: contract._id,
        attributes: {
            ownerId: contract.ownerId,
            commentAuthors: contract.comments.map((c: any) => c.userId),
        },
    }
}

export function getAllContracts(): Contract[] {
    return allContractsData;
}
