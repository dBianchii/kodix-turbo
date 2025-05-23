"use client";

import { getBaseUrl } from "@kdx/shared";
import { Button } from "@kdx/ui/button";

export const ClientUrl = () => {
  const handleTick = () => {
    console.log(getBaseUrl);
  };

  return (
    <div>
      <Button onClick={handleTick}>log base url</Button>
    </div>
  );
};
