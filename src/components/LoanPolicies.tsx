
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const LoanPolicies = () => {
  const policies = [
    {
      title: 'Default Interest Rate',
      content: 'The default annual interest rate for new loans is 5.0%. This rate may vary based on your eligibility score and market conditions.',
    },
    {
      title: 'Maximum Loan Amount',
      content: 'The maximum loan amount available is 50,000 USDC. Higher amounts may be considered for users with excellent credit history and high eligibility scores.',
    },
    {
      title: 'Minimum Eligibility Score',
      content: 'A minimum eligibility score of 60 is required for loan approval. Your score is calculated based on your contribution history, active loans, and other factors.',
    },
    {
      title: 'Late Payment Penalty',
      content: 'A penalty of 2.0% of the outstanding monthly payment will be applied for payments that are late by more than 5 business days.',
    },
  ];

  const faqs = [
    {
      question: 'How is my eligibility score calculated?',
      answer: 'Your eligibility score is determined by a combination of factors including your history of contributions to Chamas, your existing loan portfolio, and your repayment history on the platform. A higher score indicates a lower risk profile and may grant you access to better loan terms.'
    },
    {
      question: 'What can I use as collateral?',
      answer: 'We accept a variety of digital assets as collateral, including certain NFTs and crypto tokens. The value of your collateral will be assessed at the time of your loan application and must be sufficient to cover the loan amount.'
    },
    {
      question: 'How long does it take for a loan application to be approved?',
      answer: 'Loan applications are typically reviewed within 24-48 hours. Once your application is submitted, it enters the marketplace for investors to fund. The time to full funding can vary.'
    },
    {
      question: 'Can I repay my loan early?',
      answer: 'Yes, you can repay your loan at any time without any prepayment penalties. Early repayment can help you save on interest costs.'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Loan Policies</CardTitle>
          <CardDescription>Key policies that govern loan applications and repayments on our platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {policies.map((policy, index) => (
              <li key={index} className="p-4 bg-gray-50 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
                <h4 className="font-semibold text-md mb-1">{policy.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{policy.content}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions (FAQ)</CardTitle>
          <CardDescription>Answers to common questions about our loan services.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanPolicies;
