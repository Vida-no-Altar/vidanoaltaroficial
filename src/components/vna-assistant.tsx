import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestions = ["Por onde começar?", "Quais são os projetos?", "Como entrar em contato?"];

export function VnaAssistant() {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("Olá. Posso ajudar você a encontrar um projeto, canal ou informação do Vida no Altar.");
  function respond(text: string) {
    const normalized = text.toLowerCase();
    if (normalized.includes("contato")) setAnswer("O canal oficial é contato.vidanoaltaroficial@gmail.com.");
    else if (normalized.includes("projeto")) setAnswer("Hoje você pode conhecer Café no Altar, Conhecendo os Evangelhos e Vida no Altar Covers.");
    else setAnswer("Comece pelo Café no Altar para devocionais curtos ou por Conhecendo os Evangelhos para estudos com mais contexto.");
  }
  return <>
    {open && <aside className="fixed bottom-24 right-4 z-50 w-[calc(100%-2rem)] max-w-sm border border-border bg-background shadow-2xl sm:right-6" aria-label="Assistente Vida no Altar">
      <div className="flex items-center justify-between border-b border-border bg-foreground px-5 py-4 text-background"><div><p className="font-display text-lg">Assistente VnA</p><p className="text-[10px] uppercase tracking-[0.16em] opacity-60">Presença e direção</p></div><Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fechar assistente"><X /></Button></div>
      <div className="p-5"><p className="border-l-2 border-primary pl-4 text-sm leading-6">{answer}</p><div className="mt-5 flex flex-wrap gap-2">{suggestions.map((s) => <Button key={s} variant="outline" size="sm" onClick={() => respond(s)}>{s}</Button>)}</div><form className="mt-5 flex gap-2" onSubmit={(e) => {e.preventDefault(); const fd = new FormData(e.currentTarget); respond(String(fd.get("question") ?? "")); e.currentTarget.reset();}}><Input name="question" aria-label="Sua pergunta" placeholder="Digite sua pergunta" /><Button size="icon" aria-label="Enviar"><Send /></Button></form></div>
    </aside>}
    <Button variant="gold" size="editorial" className="fixed bottom-5 right-4 z-40 shadow-xl sm:right-6" onClick={() => setOpen(!open)}><MessageCircle /> Conversar com o VnA</Button>
  </>;
}