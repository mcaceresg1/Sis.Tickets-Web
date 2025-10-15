import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Nuevo Ticket</h1>
      </div>
      <div class="page-content">
        <p>Formulario de creación de tickets (en construcción)</p>
        <button class="btn btn-secondary" (click)="volver()">Volver</button>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; }
    .page-header { margin-bottom: 20px; }
    .page-content { background: white; padding: 30px; border-radius: 8px; }
    .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; }
    .btn-secondary { background-color: #6c757d; color: white; }
  `]
})
export class TicketFormComponent {
  constructor(private router: Router) {}

  volver(): void {
    this.router.navigate(['/tickets']);
  }
}

