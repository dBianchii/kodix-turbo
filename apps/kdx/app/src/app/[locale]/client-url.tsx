"use client";

import { getBaseUrl } from "@kodix/shared/utils";
import { Button } from "@kodix/ui/button";

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
