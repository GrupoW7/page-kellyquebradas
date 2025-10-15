import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome muito longo" })
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, { message: "Nome deve conter apenas letras" }),
  
  email: z
    .string()
    .trim()
    .email({ message: "E-mail inválido" })
    .max(255, { message: "E-mail muito longo" }),
  
  celular: z
    .string()
    .trim()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, { 
      message: "Formato: (11) 98765-4321" 
    }),
  
  aceitarNotificacoes: z.boolean().optional().default(false),
  
  aceitarLGPD: z.boolean().refine(val => val === true, {
    message: "Você precisa aceitar os termos de privacidade"
  })
});

type FormData = z.infer<typeof formSchema>;

const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length <= 2) {
    return numbers;
  }
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

export const PreLaunchForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      celular: "",
      aceitarNotificacoes: false,
      aceitarLGPD: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('pre_lancamento_cadastros')
        .insert([
          {
            nome: data.nome,
            email: data.email,
            celular: data.celular,
            aceitar_notificacoes: data.aceitarNotificacoes || false,
            aceitar_lgpd: data.aceitarLGPD,
          }
        ]);

      if (error) {
        // Verifica se é erro de email duplicado
        if (error.code === '23505') {
          toast.error("Este e-mail já está cadastrado!", {
            description: "Você já está na lista de pré-lançamento."
          });
        } else {
          throw error;
        }
        return;
      }
      
      // Sucesso!
      setIsSubmitted(true);
      toast.success("Cadastro realizado com sucesso!", {
        description: "Você receberá em breve informações sobre o lançamento."
      });
    } catch (error) {
      console.error("Erro ao salvar cadastro:", error);
      toast.error("Erro ao realizar cadastro", {
        description: "Por favor, tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Card de sucesso
  if (isSubmitted) {
    return (
      <Card className="border-primary/20 shadow-lg animate-fade-in">
        <CardContent className="pt-10 pb-10">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Cadastro Realizado!
              </h3>
              <p className="text-muted-foreground">
                Obrigado por se cadastrar! Você receberá em breve 
                informações exclusivas sobre o lançamento.
              </p>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Fique de olho no seu e-mail 📧
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Nome */}
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-foreground font-medium text-left block">
              Nome Completo <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Digite seu nome completo"
                {...field}
                className="h-12"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-foreground font-medium text-left block">
              E-mail <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="seu@email.com"
                {...field}
                className="h-12"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          )}
        />

        {/* Celular */}
        <FormField
          control={form.control}
          name="celular"
          render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-foreground font-medium text-left block">
              Celular <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="(11) 98765-4321"
                {...field}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  field.onChange(formatted);
                }}
                maxLength={16}
                className="h-12"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          )}
        />

        {/* Aceitar Notificações (Opcional) */}
        <FormField
          control={form.control}
          name="aceitarNotificacoes"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 bg-muted/30">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label className="text-sm font-normal text-foreground cursor-pointer">
                  Aceito receber notificações sobre novidades, promoções e ofertas exclusivas
                </Label>
              </div>
            </FormItem>
          )}
        />

        {/* LGPD (Obrigatório) */}
        <FormField
          control={form.control}
          name="aceitarLGPD"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 bg-muted/30">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label className="text-sm font-normal text-foreground cursor-pointer">
                  Li e aceito a{" "}
                  <a
                    href="#politica-privacidade"
                    className="text-primary underline hover:text-primary/80"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Política de Privacidade", {
                        description: "Link para sua política de privacidade"
                      });
                    }}
                  >
                    Política de Privacidade
                  </a>{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Botão de Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            "Garantir Acesso Antecipado"
          )}
        </Button>
      </form>
    </Form>
  );
};
