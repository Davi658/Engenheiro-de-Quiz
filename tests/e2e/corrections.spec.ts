import {test,expect} from '@playwright/test';
import {completePilot,reference} from './helpers';
test('preço livre, erros, edição e resultado por hora sem afirmação de custo real',async({page})=>{
 await completePilot(page,[...reference.slice(0,5),'20,00']);
 await expect(page.getByTestId('diagnostico-preco')).toContainText('R$ 20,00');
 await expect(page.getByTestId('diagnostico-preco')).toContainText('Abaixo da remuneração de referência');
 await expect(page.getByTestId('resultado-hora')).toHaveText('R$ -20,25/h');
 await expect(page.getByText('Simulação com valores fictícios')).toBeVisible();
 await expect(page.locator('body')).not.toContainText('Margem líquida real');
 await page.getByRole('button',{name:'Editar respostas'}).click();
 const input=page.getByLabel('Quanto você cobra por esse atendimento (R$)?');
 await expect(input).toHaveValue('20,00');
 for(const value of ['','-1','20,999']){
  await input.fill(value);await page.getByRole('button',{name:'Ver prévia'}).click();
  await expect(input).toBeFocused();await expect(input).toHaveAttribute('aria-invalid','true');
 }
 await input.fill('50.00');await page.getByRole('button',{name:'Ver prévia'}).click();
 await expect(page.getByTestId('resultado-hora')).toHaveText('R$ 22,50/h');
 await page.getByRole('button',{name:'Ver relatório de demonstração'}).click();
 await expect(page.getByTestId('resultado-hora')).toHaveText('R$ 22,50/h');
 await expect(page.getByText('Simulação com valores fictícios')).toBeVisible();
});
