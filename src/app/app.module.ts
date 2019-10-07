import { Ctcguard } from './auth/ctc-guard.service';
import { AnunciouserComponent } from './anunciouser/anunciouser.component';
import { AnuncioComponent } from './anuncio/anuncio.component';
import { HelpComponent } from './help/help.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgProbeToken } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { AuthenticationComponent } from './auth/authentication.component';
import { routing } from './app-routing.module';
import { LogoutComponent } from './auth/logout.component';
import { SignupComponent } from './auth/signup.component';
import { SigninComponent } from './auth/signin.component';
import { AuthService } from './auth/auth.service';
import { ErrorComponent } from './errors/error.component';
import { ErrorService } from './errors/error.service';
import { SuccessComponent } from './success/success.component';
import { ListusersComponent } from './auth/listusers.component';
import { PerfilComponent } from './auth/perfil.component';
import { GeneralComponent } from './auth/general.component';
import { NewpassComponent } from './auth/newpass.component';
import { SendpassComponent } from './auth/sendpass.component';
import { MsgresetmailComponent } from './success/msgresetmail.component';
import { DesignationsComponent } from './auth/designations.component';


import { phoneMaskDirective } from './auth/mask.directive';
import { StatisticComponent } from './auth/statistic.component';
import { Authguard } from './auth/auth-guard.service';
import { ScheduleComponent } from './schedule/schedule.component';
import { NewscheduleComponent } from './newschedule/newschedule.component';
import { Schedule2Component } from './schedule2/schedule2.component';
import { SetupComponent } from './setup/setup.component';
import { TelegramapiComponent } from './telegram/telegramapi.component';
import { TestsmsComponent } from './testsms/testsms.component';
import { TesttelegramComponent } from './testtelegram/testtelegram.component';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { Adminguard } from './auth/admin-guard.service';
import { Commonguard } from './auth/common-guard.service';
import { Logisticguard } from './auth/logistic-guard.service';
import { Normalguard } from './auth/normal-guard.service';
import { NewpontoComponent } from './setup/newponto.component';
import { CircuitoComponent } from './setup/circuito.component';
import { CongregationComponent } from './setup/congregation.component';
import { ShowpontosComponent } from './showpontos/showpontos.component';
import { HoraComponent } from './setup/hora.component';
import { ValidityComponent } from './setup/validity.component';
import { FeriadoComponent } from './setup/feriado.component';
import { EspecialComponent } from './setup/especial.component';
import { ExcelComponent } from './setup/excel.component';
import { ReportComponent } from './report/report.component';
import { PerfilroleComponent } from './perfilrole/perfilrole.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
registerLocaleData(localePt, 'pt-BR');



@NgModule({
    declarations: [
        AppComponent,
        AuthenticationComponent,
        LogoutComponent,
        SignupComponent,
        SigninComponent,
        ErrorComponent,
        SuccessComponent,
        ListusersComponent,
        PerfilComponent,
        HelpComponent,
        SendpassComponent,
        GeneralComponent,
        MsgresetmailComponent,
        NewpassComponent,
        StatisticComponent,
        DesignationsComponent,
        ScheduleComponent,
        Schedule2Component,
        NewscheduleComponent,
        phoneMaskDirective,
        SetupComponent,
        NewpontoComponent,
        CircuitoComponent,
        HoraComponent,
        EspecialComponent,
        ValidityComponent,
        CongregationComponent,
        ShowpontosComponent,
        TelegramapiComponent,
        TestsmsComponent,
        FeriadoComponent,
        ExcelComponent,
        TesttelegramComponent,
        ReportComponent,
        AnuncioComponent,
        AnunciouserComponent,
        PerfilroleComponent



    ],
        imports: [
            NgbModule.forRoot(),
            BrowserModule,
            FormsModule,
            routing,
            ReactiveFormsModule,
            HttpModule,
            HttpClientModule,
            AmazingTimePickerModule,
            NgxChartsModule,
            BrowserAnimationsModule,
        ],
        // tslint:disable-next-line: max-line-length
        providers: [AuthService, ErrorService, Authguard, Adminguard, Logisticguard, Normalguard, Commonguard, Ctcguard, { provide: LOCALE_ID, useValue: 'pt-BR' }],
        bootstrap: [AppComponent],

})
export class AppModule {

}
