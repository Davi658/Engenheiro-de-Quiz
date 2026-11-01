import { z } from 'zod';
const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).refine(v => !['constructor','prototype'].includes(v));
const decimal = z.string().regex(/^\d+(\.\d+)?$/).max(40);
const money = z.string().regex(/^\d+(\.\d{1,2})?$/).max(20);
const option = z.strictObject({id, label:text, values:z.record(id,decimal).optional()});
export const questionSchema = z.strictObject({type:z.literal('question'),id,label:text,required:z.boolean(),options:z.array(option).min(2)});
const profile = z.strictObject({label:text,description:text});
const pricing = z.strictObject({
 kind:z.literal('pricing-v1'), contributionQuestions:z.array(id).min(1), durationKey:id, materialsKey:id,
 availabilityQuestion:id, availabilityKey:id, profileQuestion:id, profiles:z.record(id,profile),
 priorityQuestion:id, priorityTexts:z.record(id,text),
 scenario:z.strictObject({currency:z.literal('BRL'),operatingHourly:money,compensationHourly:money,feeRate:decimal,targetMargins:z.array(decimal).length(3)}),
 packages:z.array(z.strictObject({id,label:text,overrides:z.record(id,id)})).length(2)
});
const category = z.strictObject({kind:z.literal('category-table-v1'),questionIds:z.array(id).min(1),rows:z.array(z.strictObject({answers:z.record(id,id),label:text,description:text})).min(1)});
export const quizSchema = z.strictObject({
 schemaVersion:z.literal(1), id, version:z.string().regex(/^\d+\.\d+\.\d+$/), title:text,
 locale:z.literal('pt-BR'),demo:z.literal(true),theme:z.enum(['rose','teal']),
 identification:z.array(z.strictObject({id,type:z.enum(['text','email']),label:text,required:z.boolean()})),
 pages:z.array(z.strictObject({id,title:text,blocks:z.array(z.discriminatedUnion('type',[z.strictObject({type:z.literal('text'),text}),questionSchema])).min(1)})).min(1),
 result:z.discriminatedUnion('kind',[pricing,category])
});
export type Quiz = z.infer<typeof quizSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Answers = Record<string,string>;
