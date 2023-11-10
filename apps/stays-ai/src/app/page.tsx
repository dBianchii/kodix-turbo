"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Message } from "ai";
import { useChat } from "ai/react";
import {
  LuArrowDown,
  LuLoader2,
  LuPencil,
  LuPlus,
  LuSend,
  LuUser,
  LuX,
} from "react-icons/lu";
import ReactMarkdown from "react-markdown";

import {
  Avatar,
  Badge,
  badgeVariants,
  Button,
  cn,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  toast,
} from "@kdx/ui";

import { StaysIcon, StaysLogo } from "~/components/svgs";

const joiner = "<&&>";

export default function Page() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"title" | "description">("title");

  const { messages, setInput, handleSubmit, setMessages } = useChat({
    api: `${
      process.env.NODE_ENV === "production"
        ? "https://www.kodix.com.br"
        : typeof window !== "undefined"
        ? window.location.origin.replace("3001", "3000")
        : ""
    }/api/ai`,
    onError: () => {
      setLoading(false);
      toast.error("Aconteceu um erro!, por favor, tente novamente mais tarde");
      //remove the last message the user sent
      setMessages(messages.slice(0, -1));
    },
    onFinish: () => {
      setLoading(false);
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    },
    body: {
      mode,
    },
  });

  function handleAddTag() {
    if (tagInput.trim().length === 0) return;
    setTags([...tags, tagInput]);
    setTagInput("");
  }

  function handleDeleteTag(tagToDelete: number) {
    setTags(tags.filter((_, i) => i !== tagToDelete));
  }

  function handleTagChange(index: number, newTag: string) {
    const newTags = [...tags];
    newTags[index] = newTag;
    setTags(newTags);
  }

  // Add tag when enter is pressed
  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleAddTag();
  }

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const registered = localStorage.getItem("registered");
    if (!registered) {
      setOpen(true);
      return;
    }
    setLoading(true);
    handleSubmit(e);
    setInput("");
  }

  useEffect(() => {
    const localStorageMessages = JSON.parse(
      window.localStorage.getItem("messages") ?? "[]",
    ) as Message[];

    setMessages(localStorageMessages);
  }, [setMessages]);

  useEffect(() => {
    window.localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    setInput(tags.join(joiner));
  }, [setInput, tags]);

  return (
    <main className="flex flex-col sm:flex-row">
      {messages.length ? (
        <>
          {/* <ClearChat
            onClick={() => {
              setMessages([]);
            }}
          /> */}
          <ScrollDownButton
            onClick={() => {
              lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </>
      ) : null}
      <div className="bg-background fixed bottom-0 left-0 z-50 w-full rounded-md border shadow-md sm:relative sm:w-[700px] sm:p-8">
        <div className="hidden sm:block">
          <Link target="_blank" href="https://www.stays.net">
            <StaysLogo className="h-10 w-40" />
          </Link>
        </div>
        <TitleOrDescription mode={mode} setMode={setMode} />
        <div className="bg-red-200">
          <ScrollArea className="h-36 space-x-1 space-y-4 p-4 pt-0">
            {tags.map((tag, i) => (
              <TagItem
                key={i}
                tag={tag}
                onTagChange={(newTag) => handleTagChange(i, newTag)}
                onDeleteTag={() => handleDeleteTag(i)}
              />
            ))}
          </ScrollArea>
          <div className="mb-6 flex flex-row space-x-3 p-4">
            <Input
              type="text"
              className="text-md"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(e)}
            ></Input>
            {tagInput.trim().length > 0 ? (
              <Button
                variant={"outline"}
                disabled={tagInput.trim().length === 0 || loading}
                onClick={handleAddTag}
              >
                <LuPlus className="h-4 w-4" />
              </Button>
            ) : (
              <form onSubmit={handleSend} className="m-0 p-0">
                <Dialog open={open} onOpenChange={setOpen}>
                  <Button
                    disabled={!(tags.length > 0) || loading}
                    type="submit"
                    ref={submitButtonRef}
                  >
                    {loading ? (
                      <LuLoader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LuSend className="h-4 w-4" />
                    )}
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogDescription>
                        <Form setOpen={setOpen} buttonRef={submitButtonRef} />
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </form>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="h-screen w-full">
        {messages.map((message, i) => (
          <ContextMenu key={message.id}>
            <ContextMenuTrigger disabled={message.role === "assistant"}>
              <div
                ref={messages.length - 1 === i ? lastMessageRef : null}
                className={cn(message.role === "assistant" && "bg-muted")}
              >
                <div className="mx-6 flex flex-row py-4">
                  <Avatar className="h-10 w-10">
                    {message.role === "assistant" ? (
                      <StaysIcon className="h-auto w-auto p-1" />
                    ) : (
                      <LuUser className="h-auto w-auto p-1" />
                    )}
                  </Avatar>
                  <div className="ml-4 grow text-sm leading-relaxed">
                    {message.role === "assistant" ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      message.content.split(joiner).map((tag, i) => (
                        <Badge
                          key={message.id + i}
                          className={cn("text-xs")}
                          variant={"outline"}
                        >
                          {tag}
                        </Badge>
                      ))
                    )}
                  </div>
                  {message.role === "user" && (
                    <Button
                      size={"sm"}
                      variant={"ghost"}
                      className={"sm:hidden sm:hover:block"}
                    >
                      <div>
                        <LuPencil className="h-4 w-4" />
                      </div>
                    </Button>
                  )}
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>
                <LuPencil className="mr-2 h-4 w-4" />
                Edit Event
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
        <div className="h-[250px] sm:hidden md:h-48"></div>
      </ScrollArea>
    </main>
  );
}

function TitleOrDescription({
  mode,
  setMode,
}: {
  mode: "title" | "description";
  setMode: React.Dispatch<React.SetStateAction<"title" | "description">>;
}) {
  return (
    <Tabs
      value={mode}
      className="w-[400px]"
      onValueChange={(mode) => {
        if (mode !== "title" && mode !== "description")
          throw new Error("Invalid mode");

        setMode(mode);
      }}
    >
      <TabsList>
        <TabsTrigger value="title">Título</TabsTrigger>
        <TabsTrigger value="description">Descrição</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

//function BreadCrumbs() {
//  return (
//    <ol className="flex">
//      <li>
//        <Link target="_blank" href="https://www.stays.net">
//          <StaysLogo className="h-10 w-40" />
//        </Link>
//      </li>
//      <li className="flex items-center">
//        <BsSlashLg className="text-foreground/20 h-7 w-7 -rotate-12" />
//      </li>
//      <li className="flex items-center">
//        <span className="text-2xl font-bold">IA</span>
//      </li>
//    </ol>
//  );
//}

function ScrollDownButton({ onClick }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "bg-foreground/80 absolute bottom-0 right-0 z-50 m-4 rounded-full",
      )}
      onClick={onClick}
    >
      <LuArrowDown className="h-4 w-4" />
    </Button>
  );
}

// function ClearChat({ onClick }: React.ComponentProps<typeof Button>) {
//   return (
//     <Button
//       className={
//         "bg-foreground/80 absolute right-0 top-0 z-50 m-4 rounded-full"
//       }
//       onClick={onClick}
//     >
//       <AiOutlineClear className="h-4 w-4 rotate-45" />
//     </Button>
//   );
// }

function Form({
  setOpen,
  buttonRef,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    new (window as any).RDStationForms(
      "ai-1f84733bbb7018305ac8",
      "UA-78082533-1",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ).createForm();

    function onElementLoaded() {
      const element = document.getElementById("rd-button-lkigu0y4");
      if (element) {
        element.onclick = async () => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          const nomeInput = document.getElementById(
            "rd-text_field-lkigufzg",
          ) as HTMLInputElement;
          const emailInput = document.getElementById(
            "rd-email_field-lkigufzh",
          ) as HTMLInputElement;

          if (
            nomeInput.classList.contains("error") ||
            emailInput.classList.contains("error")
          )
            return;

          localStorage.setItem("registered", "1");
          setOpen(false);
          if (buttonRef.current) {
            buttonRef.current.click();
          }
        };
      }
    }

    function isElementLoaded() {
      const element = document.getElementById("rd-button-lkigu0y4");
      return !!element;
    }
    const intervalId = setInterval(function () {
      if (isElementLoaded()) {
        clearInterval(intervalId); // Stop the interval
        onElementLoaded(); // Execute the action once the element is loaded
      }
    }, 100);
  }, [buttonRef, setOpen]);

  return <div role="main" id="ai-1f84733bbb7018305ac8"></div>;
}

function TagItem({
  tag,
  onTagChange,
  onDeleteTag,
}: {
  tag: string;
  onTagChange: (newTag: string) => void;
  onDeleteTag: () => void;
}) {
  const [editTagPopoverOpen, setEditTagPopoverOpen] = useState(false);
  const inputRef = useRef(null);

  return (
    <Popover open={editTagPopoverOpen} onOpenChange={setEditTagPopoverOpen}>
      <div className={cn("h-fit", badgeVariants({ variant: "outline" }))}>
        <PopoverTrigger asChild>
          <span>{tag}</span>
        </PopoverTrigger>
        <Button
          onClick={() => onDeleteTag()}
          className={cn("m-0 ml-2 h-2 rounded-full p-0")}
          variant={"link"}
        >
          <LuX className="text-foreground/40 h-3 w-3" />
        </Button>
      </div>
      <PopoverContent side="top">
        <Input
          ref={inputRef}
          type="text"
          size={2}
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setEditTagPopoverOpen(!editTagPopoverOpen);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
