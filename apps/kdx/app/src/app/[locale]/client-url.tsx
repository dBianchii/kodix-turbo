"use client";

import { Button } from "@kdx/ui/button";

import { getBaseUrl } from "../../../../../../packages/kodix/shared/src/utils";

export const ClientUrl = () => {
  const handleTick = () => {
    console.log(getBaseUrl());
  };

  return (
    <div>
      <Button onClick={handleTick}>log base url</Button>
    </div>
  );
};
