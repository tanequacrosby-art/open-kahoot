"use client";

import { useTranslations } from "next-intl";
import PageLayout from "@/components/PageLayout";
import Hero from "@/components/Hero";
import { startGame } from "@/lib/client/clientGameActions";
import { loadReadingSOLSet } from "@/lib/client/loadReadingSOL";
import type { Question } from "@/types/game";

export default function HostPage() {
  const t = useTranslations("host");

  return (
    <PageLayout gradient="home" showLogo={false}>
      <Hero title="Elementary SOL Prep" />

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mt-10">

        {/* Grade 3 – SOL 3.5 */}
        <button
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
          onClick={() => {
            const questions: Question[] = loadReadingSOLSet("3.5");
            startGame(questions);
          }}
        >
          Reading SOL 3.5 (Grade 3)
        </button>

        {/* Grade 4 – SOL 4.4 */}
        <button
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
          onClick={() => {
            const questions: Question[] = loadReadingSOLSet("4.4");
            startGame(questions);
          }}
        >
          Reading SOL 4.4 (Grade 4)
        </button>

        {/* Grade 5 – SOL 5.5 */}
        <button
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
          onClick={() => {
            const questions: Question[] = loadReadingSOLSet("5.5");
            startGame(questions);
          }}
        >
          Reading SOL 5.5 (Grade 5)
        </button>

      </div>
    </PageLayout>
  );
}
