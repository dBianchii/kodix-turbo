import type { CreateAbility, InferSubjects, MongoAbility } from "@casl/ability";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

interface CareTask {
  __typename: "CareTask";
  id: string;
}

type CRUD = "delete";

type Abilities = [CRUD, InferSubjects<CareTask>];

const ability2 = new AbilityBuilder(
  createMongoAbility as CreateAbility<MongoAbility<Abilities>>,
);

const asd = ability2.can("delete", "CareTask", { id: "asd" });

const { can } = ability2.build({
  detectSubjectType: (object) => object.__typename,
});

const asda = can("delete", { __typename: "CareTask", id: "asd" });
