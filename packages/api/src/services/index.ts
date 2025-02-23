import type { ServerSideT } from "@kdx/locales";

import type {
  initializePublicRepositories,
  initializeRepositoriesForTeams,
} from "../trpc/initializeRepositories";
import { appActivityLogsServiceFactory } from "./appActivityLogs.service";
import { appServiceFactory } from "./apps.service";
import { calendarAndCareTaskServiceFactory } from "./calendarAndCareTask.service";
import { notificationServiceFactory } from "./notifications.service";
import { permissionsServiceFactory } from "./permissions.service";

export const initializeServices = ({
  t,
  repositories,
  publicRepositories,
}: {
  t: ServerSideT; //TODO: services likely shouldn't to depend on t
  repositories: ReturnType<typeof initializeRepositoriesForTeams>;
  publicRepositories: ReturnType<typeof initializePublicRepositories>;
}) => {
  const {
    teamRepository,
    appRepository,
    careTaskRepository,
    calendarRepository,
  } = repositories;
  const { publicAppRepository } = publicRepositories;

  return {
    notificationService: notificationServiceFactory({
      publicUserRepository: publicRepositories.publicUserRepository,
      publicNotificationsRepository:
        publicRepositories.publicNotificationsRepository,
    }),
    appActivityLogsService: appActivityLogsServiceFactory({
      appRepository,
    }),
    appServiceFactory: appServiceFactory({
      publicAppRepository,
    }),
    permissionsService: permissionsServiceFactory({
      t,
      teamRepository,
    }),
    calendarAndCareTaskService: calendarAndCareTaskServiceFactory({
      appRepository,
      careTaskRepository,
      calendarRepository,
    }),
  };
};
