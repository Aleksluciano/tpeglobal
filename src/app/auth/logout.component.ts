import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "./auth.service";

@Component({
    selector: 'app-logout',
    template: ' '
})
export class LogoutComponent {
    constructor(private authService: AuthService, private router: Router) {

        authService.logout();
        router.navigate(['/auth', 'signin']);
    }

 
}