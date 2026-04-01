"use client";

import { useRouter } from "next/navigation";
import PhilosophyQuiz from "../../components/PhilosophyQuiz";

export default function QuizPage() {
  const router = useRouter();

  return (
    <PhilosophyQuiz
      onSkip={() => router.push("/")}
      onComplete={() => router.push("/")}
    />
  );
}
