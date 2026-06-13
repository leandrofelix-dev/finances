"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/atoms/command";
import { UserAvatarButton } from "@/components/organismos/UserAvatarButton";
import { useDashboardNavigation, type SearchItem } from "@/context/DashboardNavigationContext";
import { hrefForTab } from "@/lib/navigation";

export function AppHeader() {
  const router = useRouter();
  const navigation = useDashboardNavigation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<number | null>(null);

  async function runSearch(normalized: string) {
    setSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(normalized)}`);
      if (!response.ok) {
        setResults([]);
        return;
      }

      setResults(await response.json());
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setOpen(true);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    const normalized = value.trim();
    if (!normalized) {
      setResults([]);
      setSearching(false);
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      void runSearch(normalized);
    }, 250);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  function goToTab(tab: SearchItem["tab"]) {
    navigation?.navigateToTab(tab);
    router.push(hrefForTab(tab));
  }

  function selectResult(item: SearchItem) {
    router.push(item.href);
    navigation?.navigateToTab(item.tab);
    setQuery("");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-7">
      <div className="relative flex min-w-0 flex-1 items-center gap-2">
        <Search className="pointer-events-none absolute left-3 text-muted-foreground" size={18} />
        <Button
          className="w-full justify-start pl-10 text-muted-foreground"
          onClick={() => setOpen(true)}
          type="button"
          variant="secondary"
        >
          <span className="truncate">Buscar transações, categorias...</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button aria-label="Dívidas pendentes" onClick={() => goToTab("debts")} size="icon" variant="secondary">
          <Bell size={18} />
        </Button>
        <UserAvatarButton />
      </div>

      <CommandDialog
        open={open}
        onOpenChange={(nextOpen) => setOpen(nextOpen)}
        title="Buscar no app"
        description="Procure transações, categorias, cartões e páginas."
        showCloseButton
      >
        <CommandInput placeholder="Digite para buscar..." value={query} onValueChange={handleQueryChange} />
        <CommandList>
          {searching ? <CommandEmpty>Buscando...</CommandEmpty> : null}
          {!searching && query.trim() && results.length === 0 ? <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty> : null}
          {results.length > 0 ? (
            <CommandGroup heading="Resultados">
              {results.map((item) => (
                <CommandItem key={item.id} onSelect={() => selectResult(item)}>
                  <span className="grid gap-0.5 text-left">
                    <span>{item.label}</span>
                    {item.sublabel ? <span className="text-xs text-muted-foreground">{item.sublabel}</span> : null}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
