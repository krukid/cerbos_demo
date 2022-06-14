import { GRPC } from '@cerbos/grpc';
import { Effect, PlanKind, ResourceCheck } from '@cerbos/core';

import { type Contract, getAllContracts, toContractResource } from './contract-model';
import { UserRole, ResourceKind, ContractAction } from './acl';
import { printContracts } from './render';

class CerbosService {
    public cerbos: GRPC;
    constructor() {
        this.cerbos = new GRPC('cerbos:3593', { tls: false });
    }
}

const cerbosService = new CerbosService();

const currentUser = {
    id: '1',
    roles: [UserRole.USER],
    attributes: {},
};

const guestUser = {
    id: '4',
    roles: [UserRole.USER],
    attributes: {},
};

async function demoCheckLoadedContracts(contracts: Contract[]) {
    // create resource checks from loaded contracts
    const resources: ResourceCheck[] = contracts.map((c: Contract) => ({
        resource: toContractResource(c),
        actions: [ContractAction.VIEW],
    }));

    // check against current user
    const results = await cerbosService.cerbos.checkResources({
        principal: currentUser,
        resources,
    });

    // construct resource policy decision map
    const checkResult = resources.map((r) => {
        const result = results.findResult({ kind: r.resource.kind, id: r.resource.id });
        return result.actions[ContractAction.VIEW] === Effect.ALLOW ? {
            contract: contracts.find((c) => c._id === result.resource.id),
        } : {};
    });

    printContracts(checkResult);
}

async function demoCheckPlannedContracts(allContracts: Contract[]) {
    const planResult = await cerbosService.cerbos.planResources({
        principal: guestUser,
        action: ContractAction.VIEW,
        resource: { kind: ResourceKind.CONTRACT },
    });

    switch (planResult.kind) {
        case PlanKind.ALWAYS_ALLOWED:
            printContracts(allContracts.map((contract) => ({ contract })));
            break;
        case PlanKind.ALWAYS_DENIED:
            printContracts(allContracts.map(() => ({ contract: null })));
            break;
        case PlanKind.CONDITIONAL:
            console.log('got plan', JSON.stringify(planResult.condition));
            break;
        default:
            throw new Error('unexpected plan result');
    }
}

async function main() {
    const allContracts = getAllContracts();
    
    // check already loaded contracts for specific actions
    await demoCheckLoadedContracts(allContracts.slice(0, 2));

    // check contracts that are planned to be loaded
    await demoCheckPlannedContracts(allContracts);
}

main().catch(console.error);
